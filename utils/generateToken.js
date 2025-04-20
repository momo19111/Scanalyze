const jwt = require('jsonwebtoken');

const generateToken = (payload) => 
    jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })


module.exports = generateToken;