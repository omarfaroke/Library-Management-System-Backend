
module.exports = (app) => {
    app.use('/api/books', require('./books.routes'));
    app.use('/api/loans', require('./loans.routes'));
    app.use('/api/users', require('./users.routes'));
}