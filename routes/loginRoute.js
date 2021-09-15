const loginController = require('../controllers/loginController');

const loginSubmit = {
    method: 'POST',
    path: '/login-submit',
    config: { auth: false },
    handler: loginController.loginSubmit                          
}

const login = {
    method: 'GET',
    path: '/login',
    config: { auth: false },
    handler: loginController.login
}

module.exports = [
    loginSubmit,
    login
]