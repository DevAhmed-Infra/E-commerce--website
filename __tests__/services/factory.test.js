// Mock dependencies
jest.mock('../../utils/appError.js', () => {
  class MockAppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
      this.isOperational = true;
    }
  }
  return MockAppError;
});
jest.mock('../../utils/apiFeatures.js');
jest.mock('../../utils/httpStatus.js');

const httpStatus = require('../../utils/httpStatus.js');
const factory = require('../../services/factory.js');

describe('Factory Service', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: 'user123' }, body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all documents with pagination', async () => {
      const mockDocuments = [
        { _id: '1', name: 'Doc1' },
        { _id: '2', name: 'Doc2' }
      ];
      const mockMongoQuery = Promise.resolve(mockDocuments);
      mockMongoQuery.populate = jest.fn().mockReturnThis();

      const ApiFeaturesMock = require('../../utils/apiFeatures.js');
      ApiFeaturesMock.mockImplementation(() => ({
        filter: jest.fn().mockReturnThis(),
        limitFields: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        search: jest.fn().mockReturnThis(),
        paginate: jest.fn().mockResolvedValue(undefined),
        mongoQuery: mockMongoQuery,
        paginationResult: { page: 1, limit: 10 }
      }));

      const mockModel = {
        find: jest.fn().mockReturnValue(mockMongoQuery)
      };

      req.query = {};
      req.filterObj = {};

      const handler = factory.getAll(mockModel, { modelName: 'TestModel' });
      await handler(req, res, next);

      expect(mockModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: mockDocuments
        })
      );
    });

    it('should apply filterObj when present', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValue(0),
        getFilter: jest.fn().mockReturnValue({}),
        exec: jest.fn().mockResolvedValue([])
      };

      const mockModel = { find: jest.fn().mockReturnValue(mockQuery) };
      req.filterObj = { category: 'cat123' };
      req.query = {};

      const handler = factory.getAll(mockModel, { modelName: 'TestModel' });
      await handler(req, res, next);

      expect(mockModel.find).toHaveBeenCalledWith({ category: 'cat123' });
    });

    it('should handle populate option', async () => {
      const mockDocuments = [];
      const mockMongoQuery = {
        populate: jest.fn().mockResolvedValue(mockDocuments)
      };

      const ApiFeaturesMock = require('../../utils/apiFeatures.js');
      ApiFeaturesMock.mockImplementation(() => ({
        filter: jest.fn().mockReturnThis(),
        limitFields: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        search: jest.fn().mockReturnThis(),
        paginate: jest.fn().mockResolvedValue(undefined),
        mongoQuery: mockMongoQuery,
        paginationResult: { page: 1, limit: 10 }
      }));

      const mockModel = { find: jest.fn().mockReturnValue(mockMongoQuery) };
      req.query = {};
      req.filterObj = {};

      const handler = factory.getAll(mockModel, { populate: 'category' });
      await handler(req, res, next);

      expect(mockMongoQuery.populate).toHaveBeenCalledWith('category');
    });
  });

  describe('getOne', () => {
    it('should return a single document by id', async () => {
      const mockDocument = { _id: '123', name: 'Test Doc' };
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      const mockModel = { findById: jest.fn().mockReturnValue(mockQuery) };
      mockQuery[Symbol.asyncIterator] = async function* () {
        yield mockDocument;
      };
      mockQuery.then = (resolve) => resolve(mockDocument);

      req.params.id = '123';

      const handler = factory.getOne(mockModel, { modelName: 'TestModel' });
      await handler(req, res, next);

      expect(mockModel.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: httpStatus.SUCCESS,
        data: mockDocument
      });
    });

    it('should return 404 AppError when document not found', async () => {
      const mockModel = { findById: jest.fn().mockResolvedValue(null) };

      req.params.id = 'nonexistent';

      const handler = factory.getOne(mockModel, { modelName: 'TestModel' });
      await handler(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404
        })
      );
    });

    it('should populate relationship when specified', async () => {
      const mockDocument = { _id: '123', name: 'Test Doc', category: { _id: 'cat1' } };
      const mockModel = {
        findById: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockDocument)
        })
      };

      req.params.id = '123';

      const handler = factory.getOne(mockModel, { populate: 'category' });
      await handler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('createOne', () => {
    it('should create a new document', async () => {
      const mockDocument = { _id: '123', name: 'New Doc' };
      const mockModel = { create: jest.fn().mockResolvedValue(mockDocument) };

      req.body = { name: 'New Doc' };

      const handler = factory.createOne(mockModel);
      await handler(req, res, next);

      expect(mockModel.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: httpStatus.SUCCESS,
        data: mockDocument
      });
    });

    it('should call preValidate hook if provided', async () => {
      const mockDocument = { _id: '123', name: 'New Doc' };
      const mockModel = { create: jest.fn().mockResolvedValue(mockDocument) };
      const preValidate = jest.fn().mockResolvedValue(undefined);

      req.body = { name: 'New Doc' };

      const handler = factory.createOne(mockModel, { preValidate });
      await handler(req, res, next);

      expect(preValidate).toHaveBeenCalledWith(req, res);
    });

    it('should call preProcess hook if provided', async () => {
      const mockDocument = { _id: '123', name: 'New Doc', slug: 'new-doc' };
      const mockModel = { create: jest.fn().mockResolvedValue(mockDocument) };
      const preProcess = jest.fn((data) => ({ ...data, slug: 'new-doc' }));

      req.body = { name: 'New Doc' };

      const handler = factory.createOne(mockModel, { preProcess });
      await handler(req, res, next);

      expect(preProcess).toHaveBeenCalledWith({ name: 'New Doc' });
      expect(mockModel.create).toHaveBeenCalledWith({ name: 'New Doc', slug: 'new-doc' });
    });

    it('should populate relationships after creation', async () => {
      const mockDocument = {
        _id: '123',
        name: 'New Doc',
        populate: jest.fn().mockResolvedValue({ _id: '123', category: { _id: 'cat1' } })
      };
      const mockModel = { create: jest.fn().mockResolvedValue(mockDocument) };

      req.body = { name: 'New Doc' };

      const handler = factory.createOne(mockModel, { populate: 'category' });
      await handler(req, res, next);

      expect(mockDocument.populate).toHaveBeenCalledWith('category');
    });
  });

  describe('updateOne', () => {
    it('should update a document by id', async () => {
      const mockUpdatedDoc = { _id: '123', name: 'Updated Doc' };
      const mockModel = { findByIdAndUpdate: jest.fn().mockResolvedValue(mockUpdatedDoc) };

      req.params.id = '123';
      req.body = { name: 'Updated Doc' };

      const handler = factory.updateOne(mockModel, { modelName: 'TestModel' });
      await handler(req, res, next);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('123', req.body, {
        new: true,
        runValidators: true
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: httpStatus.SUCCESS,
        data: mockUpdatedDoc
      });
    });

    it('should return 404 when document to update not found', async () => {
      const mockModel = { findByIdAndUpdate: jest.fn().mockResolvedValue(null) };

      req.params.id = 'nonexistent';
      req.body = { name: 'Updated' };

      const handler = factory.updateOne(mockModel, { modelName: 'TestModel' });
      await handler(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404
        })
      );
    });

    it('should call preProcess hook if provided', async () => {
      const mockUpdatedDoc = { _id: '123', name: 'Updated', slug: 'updated' };
      const mockModel = { findByIdAndUpdate: jest.fn().mockResolvedValue(mockUpdatedDoc) };
      const preProcess = jest.fn((data) => ({ ...data, slug: 'updated' }));

      req.params.id = '123';
      req.body = { name: 'Updated' };

      const handler = factory.updateOne(mockModel, { preProcess });
      await handler(req, res, next);

      expect(preProcess).toHaveBeenCalledWith({ name: 'Updated' });
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { name: 'Updated', slug: 'updated' },
        {
          new: true,
          runValidators: true
        }
      );
    });
  });

  describe('deleteOne', () => {
    it('should delete a document by id', async () => {
      const mockModel = { findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '123' }) };

      req.params.id = '123';

      const handler = factory.deleteOne(mockModel);
      await handler(req, res, next);

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 when document to delete not found', async () => {
      const mockModel = { findByIdAndDelete: jest.fn().mockResolvedValue(null) };

      req.params.id = 'nonexistent';

      const handler = factory.deleteOne(mockModel, { modelName: 'TestModel' });
      await handler(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404
        })
      );
    });
  });
});
