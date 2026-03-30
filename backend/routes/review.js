const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const logger = require('../lib/core/logger');
const { canReview, saveReview, getReviews } = require('../lib/data/db');

function generateFingerprint(req) {
  const ip = req.ip || '';
  const ua = req.headers['user-agent'] || '';
  const lang = req.headers['accept-language'] || '';
  return crypto.createHash('sha256').update(ip + ua + lang).digest('hex');
}

/**
 * @openapi
 * /api/review:
 *   get:
 *     summary: Obtener listado de valoraciones
 *     description: Devuelve las valoraciones paginadas junto con estadísticas globales. Endpoint público, no requiere sesión.
 *     tags: [Reviews]
 *     security: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero de pagina
 *       - name: filter
 *         in: query
 *         schema:
 *           type: string
 *           enum: [all, positive, negative]
 *           default: all
 *         description: Filtrar por tipo de valoracion
 *     responses:
 *       200:
 *         description: Listado de valoraciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nickname:
 *                         type: string
 *                         example: xabi_ops
 *                       recommended:
 *                         type: boolean
 *                         example: true
 *                       comment:
 *                         type: string
 *                         nullable: true
 *                         example: Muy adictivo, lo recomiendo
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     positive:
 *                       type: integer
 *                       example: 38
 *                     negative:
 *                       type: integer
 *                       example: 4
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 page:
 *                   type: integer
 *       500:
 *         description: Error interno al consultar la base de datos
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const filter = ['positive', 'negative'].includes(req.query.filter) ? req.query.filter : 'all';
    const { rows, total, stats } = await getReviews({ page, limit: 6, filter });
    const totalPages = Math.ceil(total / 6) || 1;
    res.json({ success: true, reviews: rows, total, totalPages, page, stats });
  } catch (err) {
    logger.error('Error al obtener reviews', { error: err.message });
    res.status(500).json({ success: false, message: 'Error al obtener reviews' });
  }
});

/**
 * @openapi
 * /api/review/can-review:
 *   get:
 *     summary: Comprobar si el usuario puede valorar
 *     description: Genera un fingerprint a partir de IP, User-Agent y Accept-Language y comprueba si ya existe una valoracion previa. No requiere sesion.
 *     tags: [Reviews]
 *     security: []
 *     responses:
 *       200:
 *         description: Resultado de la comprobacion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canReview:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Error interno al consultar la base de datos
 */
router.get('/can-review', async (req, res) => {
  try {
    const fingerprint = generateFingerprint(req);
    const allowed = await canReview(fingerprint);
    res.json({ canReview: allowed });
  } catch (err) {
    logger.error('Error al comprobar review', { error: err.message });
    res.status(500).json({ success: false, message: 'Error al comprobar review' });
  }
});

/**
 * @openapi
 * /api/review:
 *   post:
 *     summary: Enviar una valoracion
 *     description: Guarda la valoracion del usuario. Utiliza fingerprint para evitar valoraciones duplicadas. No requiere sesion.
 *     tags: [Reviews]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recommended]
 *             properties:
 *               recommended:
 *                 type: boolean
 *                 description: true para recomendar, false para no recomendar
 *                 example: true
 *               nickname:
 *                 type: string
 *                 description: Nombre del jugador (max 50 caracteres)
 *                 example: xabi_ops
 *               comment:
 *                 type: string
 *                 description: Comentario opcional (max 500 caracteres)
 *                 example: Muy adictivo, lo recomiendo
 *               sessionId:
 *                 type: string
 *                 description: Identificador de sesion opcional para trazabilidad
 *                 example: abc123
 *     responses:
 *       200:
 *         description: Valoracion guardada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Campo recommended no proporcionado o invalido
 *       409:
 *         description: El usuario ya ha valorado anteriormente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Ya has valorado anteriormente
 *       500:
 *         description: Error interno al guardar la valoracion
 */
router.post('/', async (req, res) => {
  try {
    const { sessionId, nickname, recommended, comment } = req.body;

    if (typeof recommended !== 'boolean') {
      return res.status(400).json({ success: false, message: 'El campo recommended es requerido' });
    }

    const fingerprint = generateFingerprint(req);
    const allowed = await canReview(fingerprint);

    if (!allowed) {
      return res.status(409).json({ success: false, message: 'Ya has valorado anteriormente' });
    }

    await saveReview({
      fingerprint,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: sessionId || null,
      nickname: nickname ? String(nickname).slice(0, 50) : null,
      recommended,
      comment: comment ? String(comment).slice(0, 500) : null,
    });

    res.json({ success: true });
  } catch (err) {
    logger.error('Error al guardar review', { error: err.message });
    res.status(500).json({ success: false, message: 'Error al guardar review' });
  }
});

module.exports = router;
