const { COST_VCPU_HR, COST_RAM_GB_HR, COST_DISK_GB_HR } = require('./constants');

function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rng(lo, hi) { return lo + Math.random() * (hi - lo); }

function calcCostPerHour(specs) {
  return specs.cpuCores * COST_VCPU_HR + specs.ramGB * COST_RAM_GB_HR + specs.diskGB * COST_DISK_GB_HR;
}

function formatGameTime(gt) {
  const hours = Math.floor(gt.hour);
  const minutes = Math.round((gt.hour - hours) * 60);
  return `Día ${gt.day}, ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

module.exports = { clamp, pick, rng, calcCostPerHour, formatGameTime };
