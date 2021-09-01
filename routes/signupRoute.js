const signupController = require('../controllers/signupController');
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
    handler: signupController.signupSubmit                                   
}

const signup = {
    method: 'GET',
    path: '/signup',
    handler: signupController.signup
}

module.exports = [
    signupSubmit,
    signup
]
