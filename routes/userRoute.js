const userController = require('../controllers/userController');
const Joi = require('joi');

const addNewUser = {
    method: 'POST',
    path: '/api/add-new-user',
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
    },
    handler: userController.addNewUser                           
}

const listAllUsers = {
    method: 'GET',
    path: '/api/list-all-users',
    handler: userController.listAllUsers
}

module.exports = [
    addNewUser,
    listAllUsers
]