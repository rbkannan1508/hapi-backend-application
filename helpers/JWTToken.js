'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');

const createToken = (email) => {
  return new Promise((resolve, reject) => { 
    const token = jwt.sign({ email: email }, config.get('jwt.secret'), { algorithm: 'HS256', expiresIn: "1h" });
    if(token.length === 0) {
      reject(token);
    }
    resolve(token);
  });
}

module.exports = {
  createToken
}