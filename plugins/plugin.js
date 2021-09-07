const inert = require('inert');
const vision = require('vision');
const jwtHapi = require('hapi-auth-jwt2');

module.exports = [
    inert,
    vision,
    jwtHapi
]