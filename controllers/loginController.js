let ejs = require('ejs');
const usermodel = require('../models/User');
const rolemodel = require("../models/Role");
const tinyurlmodel = require("../models/Tinyurl");
const sequelize = require('../config/database');
const showMessageFile = './views/html/showMessage.html';
const profileFile = './views/html/profile.html';
const { createToken } = require('../helpers/JWTToken');
const config = require('config');
const redis = require('redis');
const client = redis.createClient(config.get('redis.port'));

const redisCache = require('../helpers/redisCache');

const makeid = (length) => {
    return new Promise(resolve => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        resolve(result);
    });
}

module.exports.loginSubmit = async function (request, reply) { 
    if(request) {
        let email = request.payload.email;
        let password = request.payload.password;
        console.log('request', request.payload);
        try {
            let res = await usermodel.findOne({attributes: ['password', 'accountId', 'id'], where: {email: email}});
            let resp = res.dataValues.password;
            let accountId = res.dataValues.accountId;
            let userId = res.dataValues.id;
            console.log('resp', resp);
            let check_password = resp;
            if(password === check_password) {
                console.log('Authentication Successful');
                let token = createToken(email); /* Create JWT Token */
                const cookie_options = {
                    ttl: 1 * 24 * 60 * 60 * 1000, // expires after a day
                    encoding: 'none',
                    isSecure: true,
                    isHttpOnly: true,
                    clearInvalid: false,
                    strictHeader: true
                }
                redisCache.setDataToCache('email', 3600, email);
                redisCache.setDataToCache('accountId', 3600, accountId);
                redisCache.setDataToCache('userId', 3600, userId);
                reply.view(profileFile, { email: email }).header("Authorization", token).state("token", token, cookie_options);
            } else {
                console.log('Authentication Failure');
                let message = 'Authentication Failure';
                return reply.view(showMessageFile, { message: message });
            }
        }
        catch (err) {
            console.error(err, 'Unable to log user in');
        }
    }
}

module.exports.login = async function (request, reply) {
    await reply.file('./views/html/login.html');
}

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
    // let account_email = request.payload.account_email;
    // let account_id;
    // try {
    //     let res = await usermodel.findOne({ attributes: ['account_id'], where: {email: account_email} });
    //     account_id = res.dataValues.account_id;
    //     console.log('Success in getting data from User Table');
    // } catch (err) {
    //     console.error(err, 'Failure to get data from User Table');
    // }
    try {
        let dataFromCache = await redisCache.getDataFromCache('accountId');
        console.log('dataFromCache', dataFromCache);
        let res = await usermodel.findAll({ where: {account_id: dataFromCache} });
        let userArray = [];
        console.log('Success in getting data from User Table');
        res.forEach((resp) => {
            userArray.push(resp.dataValues);
        });
        console.log('userArray', userArray);
        ejs.renderFile('./views/html/usersList.html', { userArray: userArray }, {}, (err, str) => {
            if (err) {
                console.log('Error in rendering', err);
            } else {
                reply(str).header('Content-Type','text/html');
            }
        });
    } catch (err) {
        console.error(err, 'Unable to log user in');
    }
}

module.exports.tinyurl = async function (request, reply) {
    await reply.file('./views/html/tinyurl.html');
}

module.exports.shortenurl = async function (request, reply) {
    if(request) {
        const originalUrl = request.payload.url;
        const email = request.auth.credentials.email;
        let setObject = {
            originalUrl: '',
            tinyUrl: '',
            isActive: false,
            expiryDate: '',
            userId: 1,
            accountId: 1
        };
        try {
            let dataFromCache = {};
            dataFromCache.accountId = await redisCache.getDataFromCache('accountId');
            dataFromCache.userId = await redisCache.getDataFromCache('userId');
            console.log('dataFromCache', dataFromCache);
            // let res = await usermodel.findOne({attributes: ['id', 'accountId'], where: {email: email}});
            // console.log('Success in fetching user details');
            const userId = dataFromCache.userId;
            const accountId = dataFromCache.accountId;
            const tinyUrl = await makeid(6);
            const isActive = true;
            let someDate = new Date();
            let numberOfDaysToAdd = 1;
            const expiryDate = new Date(someDate.setDate(someDate.getDate() + numberOfDaysToAdd)); 
            setObject = {
                originalUrl: originalUrl,
                tinyUrl: tinyUrl,
                isActive: isActive,
                expiryDate: expiryDate,
                userId: userId,
                accountId: accountId
            }
            console.log('setObject', setObject);
        } catch (err) {
            console.error(err, 'Failure to get data from User Table');
            let message = `Failure to get data from User Table`;
            return reply.view(showMessageFile, { message: message });
        }
        try {
            await tinyurlmodel.create({ originalUrl: setObject.originalUrl, tinyUrl: setObject.tinyUrl, isActive: setObject.isActive, expiryDate: setObject.expiryDate,
                userId: setObject.userId, accountId: setObject.accountId });
            let message = "Data Success";
            console.log('Success in creating url details');
            return reply.view(showMessageFile, { message: message });
        } catch (err) {
            console.error(err, 'Failure to create in Url Table');
            let message = `Failure to create in Url Table`;
            return reply.view(showMessageFile, { message: message });
        }
    }
}

module.exports.listAllShortenedUrls = async function (request, reply) {
    const email = request.auth.credentials.email;
    let userId;
    try {
        let res = await usermodel.findOne({ attributes: ['id'], where: {email: email} });
        userId = res.dataValues.id;
        console.log('Success in getting data from User Table');
        console.log('userId', userId);
    } catch (err) {
        console.error(err, 'Error in fetching user details');
        let message = `Error in fetching user details`;
        return reply.view(showMessageFile, { message: message });
    }
    try {
        let res = await tinyurlmodel.findAll({ attributes: ['originalUrl', 'tinyUrl'], where: {userId: userId} });
        let urlArray = [];
        console.log('Success in getting data from url Table');
        res.forEach((resp) => {
            urlArray.push(resp.dataValues);
        });
        console.log('urlArray', urlArray);
        ejs.renderFile('./views/html/urlsList.html', { urlArray: urlArray }, {}, (err, str) => {
            if (err) {
                console.log('Error in rendering', err);
            } else {
                reply(str).header('Content-Type','text/html');
            }
        });
    } catch (err) {
        console.error(err, 'Error in fetching url details');
        let message = `Error in fetching url details`;
        return reply.view(showMessageFile, { message: message });
    }
}