const xss = require('xss');

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeData = (data) => {
  if (typeof data === 'string') {
    return xss(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }

  return data;
};

const sanitizeMongoOperators = (data) => {
  if (Array.isArray(data)) {
    return data.map(sanitizeMongoOperators);
  }

  if (!isPlainObject(data)) {
    return data;
  }

  return Object.entries(data).reduce((acc, [key, value]) => {
    const safeKey = key.replaceAll('$', '').replaceAll('.', '');
    return {
      ...acc,
      [safeKey]: sanitizeMongoOperators(value)
    };
  }, {});
};

const overwriteObject = (target, source) => {
  if (!isPlainObject(target)) {
    return source;
  }

  for (const key of Object.keys(target)) {
    // Express exposes req.query as a getter-backed object, so we mutate it in place.
    // eslint-disable-next-line no-param-reassign
    delete target[key];
  }

  return Object.assign(target, source);
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeMongoOperators(sanitizeData(req.body));
  }

  if (req.params) {
    req.params = sanitizeMongoOperators(sanitizeData(req.params));
  }

  if (req.query) {
    overwriteObject(req.query, sanitizeMongoOperators(sanitizeData(req.query)));
  }

  next();
};

module.exports = sanitizeMiddleware;
