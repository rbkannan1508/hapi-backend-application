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
        const dataFromCache = {};
        dataFromCache.accountId = await redisCache.getDataFromCache('accountId');
        console.log('dataFromCache', dataFromCache);
        /* Find from Role Details */
        try {
            const response = await rolemodel.findOne({ attributes: ["id"], where: { accountId: dataFromCache.accountId, roleName: roleName }, transaction: t });
            roleId = response.id;
            console.log('Fetched roleId successfully', roleId);
        }
        catch (e) {
            console.error(e, 'Fetching roledetails failed');
            await t.rollback();
        }
        /* Insert into User Details */
        try {
            await usermodel.create({ userName: userData.username, phone: userData.phone, email: userData.email, password: userData.password,
                accountId: dataFromCache.accountId, roleId: roleId}, { transaction: t });
            console.log("Successfully inserted User Details");
        }
        catch (e) {
            console.error(e, 'Failed in inserting User Details');
            await t.rollback();
        }
    }).then(() => {
        let message = "Data Success";
        return reply.view(showMessageFile, { message: message }).code(200);
    }).catch(err => {
        console.log(err, 'error while navigating to dashboard after signup');
        const data = {
            message: 'API Failure'
        }
        reply(data).code(500);
    });
}

module.exports.listAllUsers = async function (request, reply) {
    try {
        const dataFromCache = await redisCache.getDataFromCache('accountId');
        console.log('dataFromCache', dataFromCache);
        const res = await usermodel.findAll({attributes: ['id', 'username', 'phone', 'email', 'roleId', 'accountId'], where: {account_id: dataFromCache} });
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