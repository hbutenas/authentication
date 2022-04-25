const jwt = require("jsonwebtoken");

const generateJwtTokens = async (payload) => {
    const access_token = await jwt.sign(payload, process.env.ACCESS_TOKEN, {
        expiresIn: "30s"
    });
    const refresh_token = await jwt.sign(payload, process.env.REFRESH_TOKEN, {
        expiresIn: "4h"
    });
    return {access_token, refresh_token};
};

const verifyJwtToken = async (token, secret) => {
    return jwt.verify(token, secret);
};

const assignCookiesToResponse = async (payload, Response) => {
    const {access_token, refresh_token} = await generateJwtTokens(payload);

    Response.cookie("access_token", access_token, {
        httpOnly: true,
        maxAge: 30000, // 30 seconds
    });

    Response.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        maxAge: 14400000 // 4 hours
    });
};

const deleteCookiesFromResponse = async (Response) => {
    Response.clearCookie("access_token");
    Response.clearCookie("refresh_token");

    return {message: "User successfully logged out."};
};
module.exports = {generateJwtTokens, verifyJwtToken, assignCookiesToResponse, deleteCookiesFromResponse};