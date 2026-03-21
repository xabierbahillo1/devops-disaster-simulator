const { formatGameTime } = require('./helpers');

function addLog(state, message, level = 'info') {
  state.logs.unshift({
    id: Date.now() + Math.random(),
    gameTime: formatGameTime(state.gameTime),
    message,
    level,
  });
  if (state.logs.length > 150) state.logs = state.logs.slice(0, 150);
}

module.exports = { addLog };
