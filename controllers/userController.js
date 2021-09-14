let ejs = require('ejs');
const usermodel = require('../models/User');
const rolemodel = require("../models/Role");
const sequelize = require('../config/database');
const showMessageFile = './views/html/showMessage.html';
const redisCache = require('../helpers/redisCache');

module.exports.addNewUser = async function (request, reply) {
    let userData = {};
    console.log('JWT Auth Success in Add User');
    console.log('request in addnewuser', request.payload);
    userData.username = request.payload.username;
    userData.phone = request.payload.phone;
    userData.email = request.payload.email;
    userData.password = request.payload.password;
    userData.account_email = request.payload.account_email;
    const roleName = 'User';
    // let accountId, roleId;
    await sequelize.transaction({}, async (t) => {
        /* Find from User Details */
        // try {
        //     let response = await usermodel.findOne({ attributes: ["accountId"], where: { email: userData.account_email }, transaction: t });
        //     accountId = response.dataValues.accountId;
        //     console.log('Fetched userdetails successfully');
        //     console.log('accountId', accountId);
        // }
        // catch (e) {
        //     console.error(e, 'Fetching userdetails failed');
        //     await t.rollback();
        // }
        let dataFromCache = {};
        dataFromCache.accountId = await redisCache.getDataFromCache('accountId');
        console.log('dataFromCache', dataFromCache);
        /* Find from Role Details */
        try {
            let response = await rolemodel.findOne({ attributes: ["id"], where: { accountId: dataFromCache.accountId, roleName: roleName }, transaction: t });
            roleId = response.dataValues.id;
            console.log('Fetched roledetails successfully');
            console.log('roleId', roleId);
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
            console.error(e, 'Fetching roledetails failed');
            await t.rollback();
        }
    }).then(() => {
        userData = {};
        let message = "Data Success";
        return reply.view(showMessageFile, { message: message });
    }).catch(err => {
        console.log(err, 'error while navigating to dashboard after signup')
    });
}

module.exports.listAllUsers = async function (request, reply) {
    try {
        let dataFromCache = await redisCache.getDataFromCache('accountId');
        console.log('dataFromCache', dataFromCache);
        let res = await usermodel.findAll({attributes: ['id', 'username', 'phone', 'email', 'roleId', 'accountId'], where: {account_id: dataFromCache} });
        let userArray = [];
        console.log('Success in getting data from User Table');
        res.forEach((resp) => {
            userArray.push(resp.dataValues);
        });
        console.log('userArray', userArray);
        reply(userArray);
        // ejs.renderFile('./views/html/usersList.html', { userArray: userArray }, {}, (err, str) => {
        //     if (err) {
        //         console.log('Error in rendering', err);
        //     } else {
        //         reply(str).header('Content-Type','text/html');
        //     }
        // });
    } catch (err) {
        console.error(err, 'Unable to log user in');
    }
}