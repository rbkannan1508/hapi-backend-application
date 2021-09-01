const loginController = require('../controllers/loginController');

const loginSubmit = {
    method: 'POST',
    path: '/loginSubmit',
    handler: loginController.loginSubmit                           
}

const login = {
    method: 'GET',
    path: '/login',
    handler: loginController.login 
}                                      

module.exports = [
    loginSubmit,
    login
]