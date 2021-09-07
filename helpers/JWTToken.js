'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');

function createToken(email) {
  return jwt.sign({ email: email }, config.get('jwt.secret'), { algorithm: 'HS256', expiresIn: "1h" });
}

module.exports = {
  createToken
}