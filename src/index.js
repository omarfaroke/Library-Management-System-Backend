// make sure to require dotenv before anything else in your application
require('dotenv').config();
const PORT = process.env.PORT ||= 5000;

const app = require('./app');
const connectDB = require('./config/database');


// Connect to Database
connectDB();

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Listening: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});