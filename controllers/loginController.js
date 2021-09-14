const usermodel = require('../models/User');
const showMessageFile = './views/html/showMessage.html';
const profileFile = './views/html/profile.html';
const JWTToken = require('../helpers/JWTToken');
const redisCache = require('../helpers/redisCache');

module.exports.login = async function (request, reply) {
    await reply.file('./views/html/login.html');
}

module.exports.loginSubmit = async function (request, reply) { 
    console.log('request.payload', request.payload);
    if(request) {
        let email = request.payload.email;
        let password = request.payload.password;
        console.log('request', request.payload);
        try {
            let res = await usermodel.findOne({attributes: ['password', 'accountId', 'id', 'username'], where: {email: email}});
            let resp = res.dataValues.password;
            let accountId = res.dataValues.accountId;
            let userId = res.dataValues.id;
            let check_password = resp;
            if(password === check_password) {
                console.log('Authentication Successful');
                let token = JWTToken.createToken(email); /* Create JWT Token */
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
                let data = {
                    message: 'Authentication Successful',
                    accountId: accountId,
                    userId: userId,
                    email: email,
                    username: res.dataValues.username
                };
                reply(data).header("Authorization", token).state("token", token, cookie_options);
            } else {
                let data = {
                    message: 'Authentication Failure'
                }
                reply(data);
            }
        }
        catch (err) {
            console.error(err, 'Unable to log user in');
        }
    }
}

// module.exports.errorRedirect = async function(request, reply) {
//     let data = {
//         message: 'Page Not Found'
//     }
//     reply(data).status(401);
// }
