const { StatusCodes } = require('http-status-codes');

const errorMiddleware = (err, req, res, next) => {
    // console.log(err);
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || 'Something went wrong.. Please try again later.'
    };

    if (err.code === '23505') {
        customError.statusCode = 409;
        customError.message = 'Unhandled duplicate error';
    }
    return res.status(customError.statusCode).json({ message: customError.message });
};

module.exports = errorMiddleware;