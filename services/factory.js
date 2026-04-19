const AppError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');
const asyncHandler = require('express-async-handler');
const ApiFeatures = require('../utils/apiFeatures');

const deleteOne = (Model, options = {}) => {
  const { modelName = 'document' } = options;
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new AppError(`${modelName} not found`, 404));
    }
    res.status(204).send();
  });
};

const getOne = (Model, options = {}) => {
  const { modelName = 'document', populate = null } = options;
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((field) => {
          query = query.populate(field);
        });
      } else {
        query = query.populate(populate);
      }
    }

    const document = await query;
    if (!document) {
      return next(new AppError(`${modelName} not found`, 404));
    }
    res.status(200).json({
      status: httpStatus.SUCCESS,
      data: document
    });
  });
};

const updateOne = (Model, options = {}) => {
  const { modelName = 'document', preProcess = null, populate = null } = options;
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (preProcess && typeof preProcess === 'function') {
      req.body = preProcess(req.body);
    }

    let query = Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((field) => {
          query = query.populate(field);
        });
      } else {
        query = query.populate(populate);
      }
    }

    const document = await query;
    if (!document) {
      return next(new AppError(`${modelName} not found`, 404));
    }
    res.status(200).json({
      status: httpStatus.SUCCESS,
      data: document
    });
  });
};

const createOne = (Model, options = {}) => {
  const { preValidate = null, preProcess = null, populate = null } = options;
  return asyncHandler(async (req, res, next) => {
    if (preValidate && typeof preValidate === 'function') {
      await preValidate(req, next);
    }

    if (preProcess && typeof preProcess === 'function') {
      req.body = preProcess(req.body);
    }

    let newDoc = await Model.create(req.body);

    if (populate) {
      if (Array.isArray(populate)) {
        for (const field of populate) {
          newDoc = await newDoc.populate(field);
        }
      } else {
        newDoc = await newDoc.populate(populate);
      }
    }

    res.status(201).json({
      status: httpStatus.SUCCESS,
      data: newDoc
    });
  });
};

const getAll = (Model, options = {}) => {
  const { modelName = '', populate = null } = options;
  return asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .sort()
      .search(modelName);

    await apiFeatures.paginate();

    let { mongoQuery, paginationResult } = apiFeatures;

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((field) => {
          mongoQuery = mongoQuery.populate(field);
        });
      } else {
        mongoQuery = mongoQuery.populate(populate);
      }
    }

    const documents = await mongoQuery;
    res.status(200).json({
      status: httpStatus.SUCCESS,
      paginationResult,
      data: documents
    });
  });
};

module.exports = {
  getOne,
  getAll,
  updateOne,
  deleteOne,
  createOne
};
