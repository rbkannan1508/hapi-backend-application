const signupController = require('../controllers/signupController');
const Joi = require('joi');

const signupSubmit = {
    method: 'POST',
    path: '/signup-submit',
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
        },
        auth : false
    },
    handler: signupController.signupSubmit                                   
}

const signup = {
    method: 'GET',
    path: '/signup',
    config: { auth: false },
    handler: signupController.signup
}

module.exports = [
    signupSubmit,
    signup
]
