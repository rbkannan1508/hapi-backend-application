const loginController = require('../controllers/loginController');

const loginSubmit = {
    method: 'POST',
    path: '/api/login-submit',
    config: { auth: false },
    handler: loginController.loginSubmit                          
}

const login = {
    method: 'GET',
    path: '/login',
    config: { auth: false },
    handler: loginController.login
}  

// const errorRedirect = {
//     method: 'GET',
//     path: '/',
//     config: { auth: false },
//     handler: loginController.errorRedirect
// } 

module.exports = [
    loginSubmit,
    login
]