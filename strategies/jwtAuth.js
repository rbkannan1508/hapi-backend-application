const jwt = require('hapi-auth-jwt2');
const config = require('config');
const usermodel = require('../models/User');

function validate (decoded, request, callback) {
    console.log(decoded.email, 'email');
    usermodel.findAll({ where: {email: decoded.email} })
        .then(function(res) {
            console.log('Success in fetching email details');
            if(res[0].dataValues.hasOwnProperty('id') == true) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        }).catch((err) => {
            console.log('Error in fetching email details', err);
        });
};

const name = 'jwt';
const schema =  'jwt';
const options = { 
    key: config.get('jwt.secret'), 
    validateFunc: validate,
    verifyOptions: {
        algorithms: [ 'HS256' ]
    }
}

module.exports = {
    name,
    schema,
    options
}