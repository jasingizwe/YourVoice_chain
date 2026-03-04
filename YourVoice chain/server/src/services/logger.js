function serializeError(err) {
  if (!err) return null;
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
}

function write(level, message, meta = {}) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
    return;
  }
  console.log(line);
}

export function logInfo(message, meta) {
  write('info', message, meta);
}

export function logWarn(message, meta) {
  write('warn', message, meta);
}

export function logError(message, err, meta = {}) {
  write('error', message, {
    ...meta,
    error: serializeError(err),
  });
}
