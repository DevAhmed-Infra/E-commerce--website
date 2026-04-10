const slugify = require('slugify');


const addSlugToBasicModel = (data, options = { lower: true }) => {
  if (data.name) {
    data.slug = slugify(data.name, options);
  }
  return data;
};


const addSlugToBrand = (data) => {
  if (data.name) {
    data.slug = slugify(data.name, { lower: true, strict: true });
  }
  return data;
};


const addSlugToProduct = (data) => {
  if (data.title) {
    data.slug = slugify(data.title);
  }
  return data;
};


const addSlugToSubCategory = (data) => {
  if (data.name) {
    data.slug = slugify(data.name);
  }
  return data;
};

module.exports = {
  addSlugToBasicModel,
  addSlugToBrand,
  addSlugToProduct,
  addSlugToSubCategory
};
