'use strict';

const express = require('express');
const router = express.Router();
const { requireSession } = require('../middleware/session');
const { chatWithAI } = require('../lib/ai/openrouter');
const logger = require('../lib/core/logger');

/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     summary: Chat con el asistente IA (Yamlito)
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *               chatHistory:
 *                 type: array
 *               gameContext:
 *                 type: object
 *     responses:
 *       200:
 *         description: Respuesta del asistente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 */
router.post('/chat', requireSession, async (req, res) => {
  const { message, chatHistory, gameContext } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ success: false, message: 'El mensaje no puede estar vacío' });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    logger.warn('OPENROUTER_API_KEY no configurada');
    return res.status(503).json({
      reply: 'El servicio de IA no está configurado. Añade OPENROUTER_API_KEY al .env.',
    });
  }

  try {
    const context = {
      ...gameContext,
      nickname: req.gameState.nickname,
    };

    const reply = await chatWithAI(message.trim(), chatHistory || [], context);
    res.json({ reply });
  } catch (err) {
    logger.error('Error en AI chat', { error: err.message });
    res.status(500).json({
      reply: 'Uy, problemas de conexión por mi lado. Inténtalo de nuevo en un momento. 📡',
    });
  }
});

module.exports = router;
