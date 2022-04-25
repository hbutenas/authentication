const express = require("express");
const router = express.Router();
const {check} = require("express-validator");

// controllers
const {registerController, loginController, logoutController} = require("../../controllers/auth/auth.controller");

// middlewares

router.post("/register", [
    check("email").not().isEmpty().isEmail(),
    check("username").trim().not().isEmpty().isString().isLength({min: 6}).withMessage("Username has to be at least 6 characters long"),
    check("password").trim().not().isEmpty().isLength({min: 6}).withMessage("Password has to be at least 6 characters long"),
    check("firstName").trim().optional().isString().isLength({
        min: 3,
        max: 50
    }).withMessage("Firstname has to be at least 3 characters long"),
    check("lastName").trim().optional().isString().isLength({
        min: 3,
        max: 50
    }).withMessage("Lastname has to be at least 3 characters long")
], registerController);

router.post("/login", [
    check("email").not().isEmpty().isEmail(),
    check("password").not().isEmpty(),
], loginController);

router.post("/logout", logoutController);

module.exports = router;

