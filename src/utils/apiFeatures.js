class apiFeatures {
  constructor(collection, queryString) {
    this.collection = collection;
    this.queryString = queryString;
  }
  filter() {
    const query = { ...this.queryString };
    // remove unwanted properties from query object
    ["page", "sort", "limit", "field"].forEach(
      item => query[item] && delete query[item]
    );
    // replace mongogb operators
    const queryString = JSON.stringify(query).replace(
      /(gte|gt|lte|lt)\b/gi,
      char => `$${char}`
    );
    // return mongoose query

    return this.collection.find(JSON.parse(queryString));
  }
  get sort() {
    return this.queryString.sort
      ? this.queryString.sort.replace(",", " ")
      : "-createdAt";
  }
  get fields() {
    return this.queryString.fields
      ? this.queryString.fields.replace(",", " ")
      : "";
  }
  get limit() {
    return this.queryString.limit ? Number(this.queryString.limit) : 100;
  }
  get page() {
    const page = this.queryString.page
      ? Number(this.queryString.page) === 0
        ? 0
        : Number(this.queryString.page) - 1
      : 0;
    return this.limit * page;
  }
}

module.exports = apiFeatures;
