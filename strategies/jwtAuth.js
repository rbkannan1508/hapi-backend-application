const jwt = require('hapi-auth-jwt2');
const config = require('config');
const usermodel = require('../models/User');
const redisCache = require('../helpers/redisCache');

async function validate (decoded, request, callback) {
    let email = await redisCache.getDataFromCache('email');
    if(email !== null) {
        return callback(null, true);
    } else {
        console.log(decoded.email, 'email');
        try {
            let res = await usermodel.findOne({ where: {email: decoded.email} });
            console.log('Success in fetching email details for JWT validate');
            if(res.dataValues.hasOwnProperty('id') == true) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        } catch(err) {
            console.log('Error in fetching data',err);
            return callback(null, false);
        }
    }
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