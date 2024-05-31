const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

// Security Middleware
app.use(helmet());
// app.use(cors()); // Enable All CORS Requests

// Middleware
app.use(express.json());


module.exports = app;