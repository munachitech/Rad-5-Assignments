export function log(message) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${message}`);
}

export function logError(message) {
  const time = new Date().toLocaleTimeString();
  console.error(`[${time}] ERROR: ${message}`);
}
