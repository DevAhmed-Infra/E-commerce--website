const path = require('path');

const express = require('express');
const morgan = require('morgan');

require('dotenv').config();

const { connectDatabase } = require('./config/db');
const { verifyEmailConnection } = require('./utils/sendEmail');
const logger = require('./utils/logger');

const categoryRouter = require('./routes/category.router');
const subCategoryRouter = require('./routes/subcategory.router');
const brandRouter = require('./routes/brand.router');
const productRouter = require('./routes/product.router');
const userRouter = require('./routes/user.router');
const authRouter = require('./routes/auth.router');

const globalErrorHandler = require('./middlewares/globalErrorHandler');
const NotFoundHandler = require('./middlewares/notFoundHandler');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  logger.info(`Mode : ${process.env.NODE_ENV}`);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subCategoryRouter);
app.use('/api/v1/brands', brandRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

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
