class ApiFeatures {
  constructor(mongoQuery, queryString) {
    this.mongoQuery = mongoQuery;
    this.queryString = queryString;
  }

  // Escape special regex characters to prevent ReDoS attacks
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  filter() {
    const queryStringObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excludedFields.forEach((excludedField) => {
      delete queryStringObj[excludedField];
    });

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongoQuery = this.mongoQuery.where(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.sort(sortBy);
    } else {
      this.mongoQuery = this.mongoQuery.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.select(fields);
    } else {
      this.mongoQuery = this.mongoQuery.select('-__v');
    }
    return this;
  }

  search() {
    if (this.queryString.keyword) {
      // Escape the keyword to prevent ReDoS attacks
      const escapedKeyword = this.escapeRegex(this.queryString.keyword);
      const query = {};
      query.$or = [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { description: { $regex: escapedKeyword, $options: 'i' } }
      ];
      this.mongoQuery = this.mongoQuery.where(query);
    }
    return this;
  }

  async paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = Math.min(this.queryString.limit * 1 || 50, 100); // Cap limit at max 100
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Count documents with filters and search applied
    const countDocument = await this.mongoQuery.model.countDocuments(this.mongoQuery.getFilter());

    const pagination = {};
    pagination.page = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocument / limit);

    if (endIndex < countDocument) {
      pagination.nextPage = page + 1;
    }

    if (skip > 0) {
      pagination.prevPage = page - 1;
    }
    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;

    return this;
  }
}

module.exports = ApiFeatures;
