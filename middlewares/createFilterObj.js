const createFilterObj = (paramName, fieldName) => {
  // id , document like category
  return (req, res, next) => {
    const filterObj = {};

    // req.params[paramName] is only used when your req.params.id is dynamic
    // it do the same functionality but dynamucally
    // in other words req.params.id is statis

    if (req.params[paramName]) {
      filterObj[fieldName] = req.params[paramName];
    }

    req.filterObj = filterObj;
    next();
  };
};

module.exports = createFilterObj;
