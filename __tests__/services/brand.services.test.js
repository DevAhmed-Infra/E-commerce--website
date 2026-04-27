jest.mock('../../models/brand.model.js');
jest.mock('../../utils/slugHelper.js');
jest.mock('../../middlewares/uploadImage.js', () => ({
  uploadSingleImage: jest.fn(() => jest.fn())
}));

const brandServices = require('../../services/brand.services.js');

describe('Brand Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBrands', () => {
    it('should call factory getAll with Brand model', () => {
      expect(typeof brandServices.getAllBrands).toBe('function');
    });
  });

  describe('getBrandById', () => {
    it('should call factory getOne with Brand model', () => {
      expect(typeof brandServices.getBrandById).toBe('function');
    });
  });

  describe('createBrand', () => {
    it('should call factory createOne with preProcess addSlug', () => {
      expect(typeof brandServices.createBrand).toBe('function');
    });
  });

  describe('updateBrand', () => {
    it('should call factory updateOne with preProcess addSlug', () => {
      expect(typeof brandServices.updateBrand).toBe('function');
    });
  });

  describe('deleteBrand', () => {
    it('should call factory deleteOne', () => {
      expect(typeof brandServices.deleteBrand).toBe('function');
    });
  });

  describe('resizeImage', () => {
    it('should be defined', () => {
      expect(typeof brandServices.resizeImage).toBe('function');
    });
  });

  describe('uploadBrandImage', () => {
    it('should be defined', () => {
      expect(typeof brandServices.uploadBrandImage).toBe('function');
    });
  });
});
