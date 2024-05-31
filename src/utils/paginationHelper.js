const { Model } = require('mongoose');

/**
 * Paginate a model
 * @param {Model} model - The model to paginate
 * @param {Object} query - The query to filter the results
 * @param {Number} page - The page number
 * @param {Number} limit - The number of items per page
 * @param {Array} populate - The fields to populate in the results
 * @returns {Object} - The paginated results
 * @example
 * const results = await paginate(User, { age: { $gt: 18 } }, 1, 10);
 * console.log(results);
 * // {
 * //   totalItems: 100,
 * //   totalPages: 10,
 * //   currentPage: 1,
 * //   next: { page: 2, limit: 10 },
 * //   previous: null,
 * //   data: [ ... ]
 * // }
 * 
 */
const paginate = async (model, query = {}, page = 1, limit = 10, populate = []) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    results.totalItems = await model.countDocuments(query);
    results.totalPages = Math.ceil(results.totalItems / limit);
    results.currentPage = page;

    //
    if (endIndex < results.totalItems) {
        results.next = {
            page: page + 1,
            limit: limit,
        };
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit,
        };
    }

    // should return an empty array if page is out of range
    if (startIndex >= results.totalItems) {
        results.data = [];
        return results;
    }

    if (!populate || populate.length === 0) {
        results.data = await model.find(query)
            .skip(startIndex)
            .limit(limit);

    } else {
        results.data = await model.find(query)
            .populate(populate)
            .skip(startIndex)
            .limit(limit);
    }

    return results;
};

module.exports = paginate;