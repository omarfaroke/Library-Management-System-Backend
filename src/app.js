const express = require('express');
const swagger = require('./swagger');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./middleware/error.middleware');
const app = express();

// Security Middleware
app.use(helmet());
// app.use(cors()); // Enable All CORS Requests

// Middleware
app.use(express.json());

// Routes
require('./routes')(app);

// Swagger documentation
swagger(app);

// Error Handling Middleware (Must be after defining routes)
app.use(errorHandler);

module.exports = app;