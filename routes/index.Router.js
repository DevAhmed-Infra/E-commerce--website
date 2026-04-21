const categoryRouter = require('./category.router');
const subCategoryRouter = require('./subcategory.router');
const brandRouter = require('./brand.router');
const productRouter = require('./product.router');
const userRouter = require('./user.router');
const authRouter = require('./auth.router');
const reviewRouter = require('./review.router');
const wishlistRouter = require('./wishlist.router');
const addressRouter = require('./address.router');
const couponRouter = require('./coupon.router');

const mountRoutes = (app) => {
  app.use('/api/v1/categories', categoryRouter);
  app.use('/api/v1/subcategories', subCategoryRouter);
  app.use('/api/v1/brands', brandRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/reviews', reviewRouter);
  app.use('/api/v1/wishlists', wishlistRouter);
  app.use('/api/v1/addresses', addressRouter);
  app.use('/api/v1/coupons', couponRouter);
};

module.exports = mountRoutes;
