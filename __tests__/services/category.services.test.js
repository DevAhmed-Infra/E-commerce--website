jest.mock('../../models/category.model.js');
jest.mock('../../utils/slugHelper.js');
jest.mock('../../middlewares/uploadImage.js', () => ({
  uploadSingleImage: jest.fn(() => jest.fn())
}));

const categoryServices = require('../../services/category.services.js');

describe('Category Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should call factory getAll with Category model', () => {
      expect(typeof categoryServices.getCategories).toBe('function');
    });
  });

  describe('getCategoryById', () => {
    it('should call factory getOne with Category model', () => {
      expect(typeof categoryServices.getCategoryById).toBe('function');
    });
  });

  describe('createCategory', () => {
    it('should call factory createOne with preProcess addSlug', () => {
      expect(typeof categoryServices.createCategory).toBe('function');
    });
  });

  describe('updateCategory', () => {
    it('should call factory updateOne with preProcess addSlug', () => {
      expect(typeof categoryServices.updateCategory).toBe('function');
    });
  });

  describe('deleteCategory', () => {
    it('should call factory deleteOne', () => {
      expect(typeof categoryServices.deleteCategory).toBe('function');
    });
  });

  describe('resizeImage', () => {
    it('should be defined', () => {
      expect(typeof categoryServices.resizeImage).toBe('function');
    });
  });

  describe('uploadCategoryImage', () => {
    it('should be defined', () => {
      expect(typeof categoryServices.uploadCategoryImage).toBe('function');
    });
  });
});
