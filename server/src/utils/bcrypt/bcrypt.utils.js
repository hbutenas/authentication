const bcrypt = require('bcryptjs');

const hashPassword = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const validatePassword = async (providedPassword, realPassword) => {
    return await bcrypt.compare(providedPassword, realPassword);
};

module.exports = { hashPassword, validatePassword };