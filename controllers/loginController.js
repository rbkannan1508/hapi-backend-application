const usermodel = require('../models/User');
const JWTToken = require('../helpers/JWTToken');
const redisCache = require('../helpers/redisCache');
const bcrypt = require ('bcrypt');
const cookie_options = require('../config/constants');

module.exports.login = async function (request, reply) {
    await reply.file('./views/html/login.html');
}

module.exports.loginSubmit = async function (request, reply) { 
    const email = request.payload.email;
    const password = request.payload.password;
    try {
        const res = await usermodel.findOne({attributes: ['password', 'accountId', 'id', 'userName'], where: {email: email}});
        const check_password = res.password;
        const accountId = res.accountId;
        const userId = res.id;
        const match = await bcrypt.compare(password, check_password);
        if(match === true) {
            console.log('Authentication Successful');
            try {
                const token = await JWTToken.createToken(email);
                const userDetails = {
                    email: email,
                    accountId: accountId,
                    userId: userId,
                }
                const key = 'userDetails_' + email;
                const ttl = 3600;
                redisCache.setDataToCache(key, ttl, JSON.stringify(userDetails));
                const data = {
                    message: 'Authentication Successful',
                    accountId: accountId,
                    userId: userId,
                    email: email,
                    username: res.userName
                };
                reply(data).state("token", token, cookie_options).code(200);
            } catch(err) {
                const data = {
                    message: 'Error in token creation'
                }
                reply(data).code(401);
            }
        } else {
            const data = {
                message: 'Username and Password does not match'
            }
            reply(data).code(401);
        }
    }
    catch (err) {
        console.error(err, 'Unable to log user in');
        const data = {
            message: 'API failure'
        }
        reply(data).code(401);
    }
}