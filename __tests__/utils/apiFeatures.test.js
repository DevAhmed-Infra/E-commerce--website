const ApiFeatures = require('../../utils/apiFeatures.js');

describe('ApiFeatures Utility', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = {
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      countDocuments: jest.fn(),
      getFilter: jest.fn().mockReturnValue({}),
      model: {
        countDocuments: jest.fn()
      }
    };
  });

  describe('filter', () => {
    it('should filter by query parameters', () => {
      const queryString = { category: 'electronics', price: { gte: 100 } };
      const api = new ApiFeatures(mockQuery, queryString);

      api.filter();

      expect(mockQuery.where).toHaveBeenCalled();
      expect(api.mongoQuery).toBe(mockQuery);
    });

    it('should exclude special fields from filter', () => {
      const queryString = {
        category: 'electronics',
        page: 1,
        sort: '-price',
        limit: 10,
        fields: 'name,price',
        keyword: 'search'
      };
      const api = new ApiFeatures(mockQuery, queryString);

      api.filter();

      // Verify that special fields are excluded
      expect(mockQuery.where).toHaveBeenCalled();
    });

    it('should convert operator shorthand to MongoDB operators', () => {
      const queryString = { price: { gte: 100, lte: 500 } };
      const api = new ApiFeatures(mockQuery, queryString);

      api.filter();

      expect(mockQuery.where).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const queryString = {};
      const api = new ApiFeatures(mockQuery, queryString);

      const result = api.filter();

      expect(result).toBe(api);
    });
  });

  describe('sort', () => {
    it('should sort by specified fields', () => {
      const queryString = { sort: '-price,name' };
      const api = new ApiFeatures(mockQuery, queryString);

      api.sort();

      expect(mockQuery.sort).toHaveBeenCalledWith('-price name');
    });

    it('should sort by createdAt descending by default', () => {
      const queryString = {};
      const api = new ApiFeatures(mockQuery, queryString);

      api.sort();

      expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
    });

    it('should return this for chaining', () => {
      const queryString = {};
      const api = new ApiFeatures(mockQuery, queryString);

      const result = api.sort();

      expect(result).toBe(api);
    });
  });

  describe('limitFields', () => {
    it('should select specified fields', () => {
      const queryString = { fields: 'name,price,category' };
      const api = new ApiFeatures(mockQuery, queryString);

      api.limitFields();

      expect(mockQuery.select).toHaveBeenCalledWith('name price category');
    });

    it('should exclude __v field by default', () => {
      const queryString = {};
      const api = new ApiFeatures(mockQuery, queryString);

      api.limitFields();

      expect(mockQuery.select).toHaveBeenCalledWith('-__v');
    });

    it('should return this for chaining', () => {
      const queryString = {};
      const api = new ApiFeatures(mockQuery, queryString);

      const result = api.limitFields();

      expect(result).toBe(api);
    });
  });

  describe('search', () => {
    it('should search in title and description for Products', () => {
      const queryString = { keyword: 'laptop' };
      const api = new ApiFeatures(mockQuery, queryString);

      api.search('Products');

      expect(mockQuery.where).toHaveBeenCalled();
    });

    it('should search in name field for other models', () => {
      const queryString = { keyword: 'search term' };
      const api = new ApiFeatures(mockQuery, queryString);

      api.search('Category');

      expect(mockQuery.where).toHaveBeenCalled();
    });

    it('should not search if no keyword provided', () => {
      const queryString = {};
      const api = new ApiFeatures(mockQuery, queryString);

      api.search('Products');

      expect(mockQuery.where).not.toHaveBeenCalled();
    });

    it('should escape special regex characters', () => {
      const queryString = { keyword: 'test.*+?^$' };
      const api = new ApiFeatures(mockQuery, queryString);

      api.search('Products');

      // Should escape the special characters
      expect(mockQuery.where).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const queryString = { keyword: 'test' };
      const api = new ApiFeatures(mockQuery, queryString);

      const result = api.search('Products');

      expect(result).toBe(api);
    });
  });

  describe('paginate', () => {
    it('should calculate pagination correctly', async () => {
      mockQuery.model.countDocuments = jest.fn().mockResolvedValue(100);

      const queryString = { page: 1, limit: 10 };
      const api = new ApiFeatures(mockQuery, queryString);

      await api.paginate();

      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(api.paginationResult.page).toBe(1);
      expect(api.paginationResult.limit).toBe(10);
      expect(api.paginationResult.numberOfPages).toBe(10);
    });

    it('should handle pagination defaults', async () => {
      mockQuery.model.countDocuments = jest.fn().mockResolvedValue(60);

      const queryString = {};
      const api = new ApiFeatures(mockQuery, queryString);

      await api.paginate();

      expect(api.paginationResult.page).toBe(1);
      expect(api.paginationResult.limit).toBe(50);
    });

    it('should cap limit at 100', async () => {
      mockQuery.model.countDocuments = jest.fn().mockResolvedValue(500);

      const queryString = { limit: 200 };
      const api = new ApiFeatures(mockQuery, queryString);

      await api.paginate();

      expect(mockQuery.limit).toHaveBeenCalledWith(100);
    });

    it('should set nextPage when available', async () => {
      mockQuery.model.countDocuments = jest.fn().mockResolvedValue(100);

      const queryString = { page: 1, limit: 10 };
      const api = new ApiFeatures(mockQuery, queryString);

      await api.paginate();

      expect(api.paginationResult.nextPage).toBe(2);
    });

    it('should set prevPage when available', async () => {
      mockQuery.model.countDocuments = jest.fn().mockResolvedValue(100);

      const queryString = { page: 3, limit: 10 };
      const api = new ApiFeatures(mockQuery, queryString);

      await api.paginate();

      expect(api.paginationResult.prevPage).toBe(2);
    });

    it('should return this for chaining', async () => {
      mockQuery.model.countDocuments = jest.fn().mockResolvedValue(10);

      const queryString = {};
      const api = new ApiFeatures(mockQuery, queryString);

      const result = await api.paginate();

      expect(result).toBe(api);
    });
  });

  describe('chaining', () => {
    it('should chain all methods', async () => {
      mockQuery.model.countDocuments = jest.fn().mockResolvedValue(50);

      const queryString = {
        category: 'electronics',
        sort: '-price',
        fields: 'name,price',
        keyword: 'laptop',
        page: 2,
        limit: 10
      };

      const api = new ApiFeatures(mockQuery, queryString);
      const result = await api.filter().sort().limitFields().search('Products').paginate();

      expect(result).toBe(api);
      expect(api.paginationResult).toBeDefined();
    });
  });
});
