const accountController = require('../controllers/signupController');
const Joi = require('joi');

const signupSubmit = {
    method: 'POST',
    path: '/signupSubmit',
    config: {
        validate: {
            payload:
                Joi.object({
                    username: Joi.string().required(),
                    phone: Joi.number().required(),
                    email: Joi.string().required(),
                    password: Joi.string().required(),
                    account: Joi.string().required()
                })
        }
    },
    handler: accountController.signup                                   
}

const signup = {
    method: 'GET',
    path: '/signup',
    handler: function (request, reply) {
        reply.file('./views/html/signup.html');    
    } 
}

module.exports = [
    signupSubmit,
    signup
]
