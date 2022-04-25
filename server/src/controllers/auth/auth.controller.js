const {validationResult} = require("express-validator");
const {StatusCodes} = require("http-status-codes");
const {registerService, loginService, logoutService} = require("../../services/auth/auth.services");

const registerController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
    }

    const response = await registerService(req.body);
    res.status(StatusCodes.CREATED).json({response});
};

const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({errors: errors.array()});
    }

    const response = await loginService(req, res);
    res.status(StatusCodes.OK).json({response});
};

const logoutController = async (req, res) => {
    const response = await logoutService(res);
    res.status(StatusCodes.OK).json({response});
};

module.exports = {registerController, loginController, logoutController};