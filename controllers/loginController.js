let ejs = require('ejs');
const usermodel = require('../models/Userdetails');
const showMessageFile = './views/html/showMessage.html';

module.exports.loginSubmit = function (request, reply) { 
    if(request) {
    let username = request.payload.username;
    let password = request.payload.password;

    ejs.renderFile('./views/html/profile.html', { username: username }, {}, (err, str) => {
            if (err) {
                console.log('Error in rendering', err);
            } else {
                usermodel.findAll({attributes: ['password'], where: {username: username}})
                .then(function(res) {
                    let resp = res[0].dataValues.password;
                    let check_password = resp;
                    if(password === check_password) {
                        console.log('Authentication Successful');
                        reply(str).header('Content-Type','text/html');
                    } else {
                        console.log('Authentication Failure');
                        let message = 'Authentication Failure';
                        return reply.view(showMessageFile, { message: message });
                    }
                })
                .catch((err) => {
                    console.log('Error in getting data from User Table' + err);
                }) 
            }    
        });
    }
}

module.exports.login = function (request, reply) {
    reply.file('./views/html/login.html');
}