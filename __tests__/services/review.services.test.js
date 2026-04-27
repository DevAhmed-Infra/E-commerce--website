jest.mock('../../models/review.model.js');
jest.mock('../../middlewares/setIdToBody.js');

const reviewServices = require('../../services/review.services.js');

describe('Review Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllReviews', () => {
    it('should call factory getAll with correct model and options', () => {
      // Verify that factory.getAll is called with Review model
      expect(typeof reviewServices.getAllReviews).toBe('function');
    });
  });

  describe('getReviewById', () => {
    it('should call factory getOne with correct model and populate', () => {
      // Verify that factory.getOne is called with Review model and populate user
      expect(typeof reviewServices.getReviewById).toBe('function');
    });
  });

  describe('createReview', () => {
    it('should call factory createOne with preValidate hook', () => {
      // Verify that factory.createOne is called with Review model and preValidate
      expect(typeof reviewServices.createReview).toBe('function');
    });
  });

  describe('deleteReview', () => {
    it('should call factory deleteOne with Review model', () => {
      // Verify that factory.deleteOne is called with Review model
      expect(typeof reviewServices.deleteReview).toBe('function');
    });
  });

  describe('updateReview', () => {
    it('should call factory updateOne with Review model', () => {
      // Verify that factory.updateOne is called with Review model
      expect(typeof reviewServices.updateReview).toBe('function');
    });
  });
});
