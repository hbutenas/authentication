// const {check, validationResult} = require("express-validator");
//
// const validateRegistration = async (req, res, next) => {
//     check("email").not().isEmpty().isEmail();
//
//     const errors = validationResult(req);
//
//     if (!errors.isEmpty()) {
//         return res.status(400).json({errors: errors.array()});
//     }
//     next();
// };
//
// module.exports = {validateRegistration};