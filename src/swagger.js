const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');


module.exports = (app) => {

    /// override swagger.json host
    const host = `${process.env.HOST || 'localhost'}:${process.env.PORT}`;
    swaggerDocument.host = host;

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};