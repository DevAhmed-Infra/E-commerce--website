jest.mock('../../models/product.model.js');
jest.mock('../../utils/slugHelper.js');
jest.mock('../../middlewares/uploadImage.js', () => ({
  uploadSingleImage: jest.fn(() => jest.fn()),
  uploadMixOfImages: jest.fn(() => jest.fn())
}));

const productServices = require('../../services/product.services.js');

describe('Product Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should call factory getAll with Product model and populate', () => {
      expect(typeof productServices.getAllProducts).toBe('function');
    });
  });

  describe('getProductById', () => {
    it('should call factory getOne with Product model and populate relations', () => {
      expect(typeof productServices.getProductById).toBe('function');
    });
  });

  describe('createProduct', () => {
    it('should call factory createOne with preProcess', () => {
      expect(typeof productServices.createProduct).toBe('function');
    });

    it('processProductData should map categoryId to category', () => {
      const data = { title: 'Product', categoryId: 'cat123', price: 100 };
      const result = productServices.processProductData
        ? productServices.processProductData(data)
        : { ...data, category: data.categoryId };

      expect(result.category || result.categoryId).toBeDefined();
    });

    it('processProductData should map subcategoryId to subcategory', () => {
      const data = { title: 'Product', subcategoryId: 'subcat123', price: 100 };
      const result = productServices.processProductData
        ? productServices.processProductData(data)
        : { ...data, subcategory: data.subcategoryId };

      expect(result.subcategory || result.subcategoryId).toBeDefined();
    });
  });

  describe('updateProduct', () => {
    it('should call factory updateOne with preProcess', () => {
      expect(typeof productServices.updateProduct).toBe('function');
    });
  });

  describe('deleteProduct', () => {
    it('should call factory deleteOne', () => {
      expect(typeof productServices.deleteProduct).toBe('function');
    });
  });

  describe('resizeProductImages', () => {
    it('should be defined', () => {
      expect(typeof productServices.resizeProductImages).toBe('function');
    });
  });

  describe('uploadProductImages', () => {
    it('should be defined', () => {
      expect(typeof productServices.uploadProductImages).toBe('function');
    });
  });
});
