const Joi = require('joi');

/**
 * Function to make all fields optional in a schema.
 * 
 * useful when you want to allow partial updates to a resource (e.g., PATCH requests, updating a user profile, etc.).
 * 
 * @param {Joi.ObjectSchema<any>} schema - The schema to modify
 * @param {Object} excludedFields - The fields to exclude from making optional [optional]
 * @returns {Joi.ObjectSchema<any>} - The modified schema after making the fields optional
 * 
 * @example
 * const schema = Joi.object({
 *    name: Joi.string().required(),
 *    email: Joi.string().required(),
 *    age: Joi.number().required(),
 * });
 * 
 * const fields = {
 *   name: 'John Doe',
 *   age: 30
 * };
 * 
 * const modifiedSchema = makeSchemaFieldsOptional({ schema, fields });
 * const { error, value } = modifiedSchema.validate(fields);
 * 
 * console.log(error); // null
 * 
 * 
 */
const makeSchemaFieldsOptional = function (schema, excludedFields = {}) {
    // get all the keys in the excludedFields object
    const excludedKeys = Object.keys(excludedFields ?? {});

    // get all the keys in the schema
    const schemaKeys = schema.describe().keys;

    // filter out the schema keys that are in the excludedFields object
    const filteredSchema = Object.keys(schemaKeys).filter((key) => !excludedKeys.includes(key));

    // modify the schema to make the fields optional that are not in the excludedFields object
    const modifiedSchema = schema.fork(filteredSchema, (schema) => schema.optional());

    return modifiedSchema;
}

module.exports = {
    makeSchemaFieldsOptional
};