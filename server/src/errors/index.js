const CustomError = require('./types/CustomError');
const BadRequest = require('./types/BadRequest');
const InternalServer = require('./types/InternalServer');
const Unauthenticated = require('./types/Unauthenticated');
const Unauthorized = require('./types/Unauthorized');

module.exports = {
    CustomError,
    BadRequest,
    InternalServer,
    Unauthenticated,
    Unauthorized
};