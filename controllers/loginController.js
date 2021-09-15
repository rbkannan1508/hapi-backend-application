const usermodel = require('../models/User');
const showMessageFile = './views/html/showMessage.html';
const profileFile = './views/html/profile.html';
const JWTToken = require('../helpers/JWTToken');
const redisCache = require('../helpers/redisCache');
const bcrypt = require ('bcrypt');

module.exports.login = async function (request, reply) {
    await reply.file('./views/html/login.html');
}

module.exports.loginSubmit = async function (request, reply) { 
    if(request) {
        const email = request.payload.email;
        const password = request.payload.password;
        try {
            const res = await usermodel.findOne({attributes: ['password', 'accountId', 'id', 'username'], where: {email: email}});
            const check_password = res.password;
            const accountId = res.accountId;
            const userId = res.id;
            const match = await bcrypt.compare(password, check_password);
            if(match === true) {
                console.log('Authentication Successful');
                const token = JWTToken.createToken(email);
                const cookie_options = {
                    ttl: 1 * 24 * 60 * 60 * 1000, // expires after a day
                    encoding: 'none',
                    isSameSite: false,
                    isSecure: true,
                    isHttpOnly: false,
                    clearInvalid: false,
                    strictHeader: true,
                    path: '/'
                }
                redisCache.setDataToCache('email', 3600, email);
                redisCache.setDataToCache('accountId', 3600, accountId);
                redisCache.setDataToCache('userId', 3600, userId);
                const data = {
                    message: 'Authentication Successful',
                    accountId: accountId,
                    userId: userId,
                    email: email,
                    username: res.dataValues.username
                };
                reply(data).header("Authorization", token).state("token", token, cookie_options).code(200);
            } else {
                const data = {
                    message: 'Authentication Failure'
                }
                reply(data).code(401);
            }
        }
        catch (err) {
            console.error(err, 'Unable to log user in');
            const data = {
                message: 'Authentication Failure'
            }
            reply(data).code(401);
        }
    }
}