const { StatusCodes } = require('http-status-codes');
const CustomError = require('./CustomError');

class InternalServer extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    }
}

module.exports = InternalServer;