const loginController = require('../controllers/loginController');
const Joi = require('joi');

const loginSubmit = {
    method: 'POST',
    path: '/loginSubmit',
    config: { auth: false },
    handler: loginController.loginSubmit                          
}

const login = {
    method: 'GET',
    path: '/login',
    config: { auth: false },
    handler: loginController.login
}  

const addNewUser = {
    method: 'POST',
    path: '/addNewUser',
    config: {
        validate: {
            payload:
                Joi.object({
                    username: Joi.string().required(),
                    phone: Joi.number().required(),
                    email: Joi.string().required(),
                    password: Joi.string().required(),
                    account_email: Joi.string().required()
                })
        }
        // auth: 'jwt'
    },
    handler: loginController.addNewUser                           
}

const listAllUsers = {
    method: 'POST',
    path: '/listAllUsers',
    // config: { auth: 'jwt' },
    handler: loginController.listAllUsers
}

const tinyurl = {
    method: 'GET',
    path: '/tinyurl',
    // config: { auth: 'jwt' },
    handler: loginController.tinyurl
}

const shortenurl = {
    method: 'POST',
    path: '/shortenurl',
    // config: { auth: 'jwt' },
    handler: loginController.shortenurl
}

const listAllShortenedUrls = {
    method: 'GET',
    path: '/listAllShortenedUrls',
    // config: { auth: 'jwt' },
    handler: loginController.listAllShortenedUrls
}

module.exports = [
    loginSubmit,
    login,
    addNewUser,
    listAllUsers,
    tinyurl,
    shortenurl,
    listAllShortenedUrls
]