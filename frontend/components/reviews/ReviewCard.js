function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReviewCard({ review, index }) {
  const isPositive = review.recommended;

  return (
    <div
      className={`rv-card ${isPositive ? 'rv-card-positive' : 'rv-card-negative'}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="rv-card-header">
        <span className="rv-thumb">{isPositive ? '👍' : '👎'}</span>
        <span className={`rv-verdict ${isPositive ? 'rv-verdict-positive' : 'rv-verdict-negative'}`}>
          {isPositive ? 'RECOMENDADO' : 'NO RECOMENDADO'}
        </span>
      </div>

      {review.comment ? (
        <p className="rv-comment">"{review.comment}"</p>
      ) : (
        <p className="rv-comment rv-comment-empty">Sin comentario</p>
      )}

      <div className="rv-card-footer">
        <span className={`rv-nick ${review.nickname ? '' : 'rv-nick--anon'}`}>
          {review.nickname || 'anonimo'}
        </span>
        <span className="rv-date">{formatDate(review.created_at)}</span>
      </div>
    </div>
  );
}
