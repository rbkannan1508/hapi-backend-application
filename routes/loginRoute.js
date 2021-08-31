const loginController = require('../controllers/loginController');

const loginSubmit = {
    method: 'POST',
    path: '/loginSubmit',
    handler: loginController.login                           
}

const login = {
    method: 'GET',
    path: '/login',
    handler: function (request, reply) {
        reply.file('./views/html/login.html');
    }  
}                                      

module.exports = {
    loginSubmit,
    login
}