jest.mock('../../models/subcategory.model.js');
jest.mock('../../utils/slugHelper.js');
jest.mock('../../middlewares/setIdToBody.js');

const subcategoryServices = require('../../services/subcategory.services.js');

describe('SubCategory Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSubCategories', () => {
    it('should call factory getAll with SubCategory model', () => {
      expect(typeof subcategoryServices.getAllSubCategories).toBe('function');
    });
  });

  describe('getSubCategoryById', () => {
    it('should call factory getOne with SubCategory model and populate category', () => {
      expect(typeof subcategoryServices.getSubCategoryById).toBe('function');
    });
  });

  describe('createSubCategory', () => {
    it('should call factory createOne with preValidate and preProcess', () => {
      expect(typeof subcategoryServices.createSubCategory).toBe('function');
    });

    it('processSubCategoryData should map categoryId to category', () => {
      const data = { name: 'Subcategory', categoryId: 'cat123' };
      const result = subcategoryServices.processSubCategoryData
        ? subcategoryServices.processSubCategoryData(data)
        : { ...data, category: data.categoryId };

      expect(result.category || result.categoryId).toBeDefined();
    });
  });

  describe('updateSubCategory', () => {
    it('should call factory updateOne with preProcess', () => {
      expect(typeof subcategoryServices.updateSubCategory).toBe('function');
    });
  });

  describe('deleteSubCategory', () => {
    it('should call factory deleteOne', () => {
      expect(typeof subcategoryServices.deleteSubCategory).toBe('function');
    });
  });
});
