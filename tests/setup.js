const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
// const connectDB = require('../src/config/database');

const dbOpts = {
    mongodbMemoryServerOptions: {
        instance: {
            dbName: 'library-test',
        },
        binary: {
            version: 'latest', // Or specify a version like '5.0.10'
            downloadDir: './.mongodb-bin',
        },
        autoStart: false, // We will manually start and stop the server 
    },
};

let mongoServer;

module.exports.setUp = async () => {

    mongoServer = await MongoMemoryServer.create(dbOpts);
    const uri = mongoServer.getUri();

    // override the database uri with the in-memory server uri
    // process.env.MONGO_URI = uri;

    // connect to the in-memory server
    // await connectDB();
    await mongoose.connect(uri, {});
};

module.exports.tearDown = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};
