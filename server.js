require('dotenv').config();
const path = require('path');

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const hpp = require('hpp');
const sanitizeMiddleware = require('./middlewares/sanitizeMiddlerware');

const rateLimit = require('express-rate-limit');

const { connectDatabase } = require('./config/db');
const { verifyEmailConnection } = require('./utils/sendEmail');
const logger = require('./utils/logger');
const stripeWebhookBody = require('./middlewares/stripeWebhookBody');

const mountRoutes = require('./routes/index.Router');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const NotFoundHandler = require('./middlewares/notFoundHandler');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  logger.info(`Mode : ${process.env.NODE_ENV}`);
}
/**
 * this is CHAIN OF RESPONSIBILITY DESIGN PATTERN
 */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(cors());
app.use(compression());
app.use(
  express.json({
    verify: stripeWebhookBody,
    limit: '10kb'
  })
);
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(hpp());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/api', limiter);
app.use('/api', sanitizeMiddleware);

mountRoutes(app);
app.use(NotFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;

let server;

process.on('uncaughtException', (err) => {
  logger.fatal('uncaught_exception', {
    message: err.message,
    name: err.name,
    stack: err.stack
  });

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));

  logger.fatal('unhandled_rejection', {
    message: err.message,
    name: err.name,
    stack: err.stack
  });

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

(async () => {
  try {
    await connectDatabase();
    await verifyEmailConnection();

    const normalizedPort = Number(PORT);
    server = app.listen(Number.isNaN(normalizedPort) ? PORT : normalizedPort, () => {
      logger.info(`app running on port ${PORT}`);
    });
  } catch (err) {
    logger.fatal('startup_error', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    process.exit(1);
  }
})();
