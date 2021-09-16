let ejs = require('ejs');
const usermodel = require('../models/User');
const rolemodel = require("../models/Role");
const sequelize = require('../config/database');
const showMessageFile = './views/html/showMessage.html';
const redisCache = require('../helpers/redisCache');

module.exports.addNewUser = async function (request, reply) {
    const userData = {};
    console.log('request', request.payload);
    userData.username = request.payload.username;
    userData.phone = request.payload.phone;
    userData.email = request.payload.email;
    userData.password = request.payload.password;
    userData.account_email = request.payload.account_email;
    const roleName = 'User';
    await sequelize.transaction({}, async (t) => {
        const account_email = request.auth && request.auth.credentials && request.auth.credentials.email;
        const dataFromCache = {};
        const key = 'userDetails_' + account_email;
        const userDetails = JSON.parse(await redisCache.getDataFromCache(key));
        console.log('userDetails', userDetails);
        dataFromCache.accountId = userDetails.accountId;
        try {
            /* Find from Role Details */
            const response = await rolemodel.findOne({ attributes: ["id"], where: { accountId: dataFromCache.accountId, roleName: roleName }, transaction: t });
            roleId = response.id;
            console.log('Fetched roleId successfully', roleId);

            /* Insert into User Details */
            await usermodel.create({ userName: userData.username, phone: userData.phone, email: userData.email, password: userData.password,
                accountId: dataFromCache.accountId, roleId: roleId}, { transaction: t });
            console.log("Successfully inserted User Details");

            /** Replying to front-end */
            const message = "User Insertion Success";
            reply(message).code(200);
        }
        catch (e) {
            console.error(e, 'Failed in inserting User Details');
            const data = {
                message: 'API Failure'
            }
            reply(data + e).code(500);
        }
    });
}

module.exports.listAllUsers = async function (request, reply) {
    try {
        const email = request.auth && request.auth.credentials && request.auth.credentials.email;
        const key = 'userDetails_' + email;
        const userDetails = JSON.parse(await redisCache.getDataFromCache(key));
        const accountId = userDetails.accountId;
        const res = await usermodel.findAll({attributes: ['id', 'username', 'phone', 'email', 'roleId', 'accountId'], where: {account_id: accountId} });
        let userArray = [];
        console.log('Success in getting data from User Table');
        res.forEach((resp) => {
            userArray.push(resp.dataValues);
        });
        console.log('userArray', userArray);
        reply(userArray).code(200);
    } catch (err) {
        console.error(err, 'Failure in getting data from User Table');
        const data = {
            message: 'API Failure'
        }
        reply(data).code(500);
    }
}