let ejs = require('ejs');
const usermodel = require('../models/User');
const tinyurlmodel = require("../models/Tinyurl");
const showMessageFile = './views/html/showMessage.html';
const redisCache = require('../helpers/redisCache');
const generateId = require('../helpers/generateId');
const emailQueue = require('../helpers/emailQueue');
const config = require('config');

const homeUrl = config.get('server.url')+config.get('server.port')+'/listAllShortenedUrls';

module.exports.tinyurl = async function (request, reply) {
    await reply.file('./views/html/tinyurl.html');
}

module.exports.shortenurl = async function (request, reply) {
    if(request) {
        const originalUrl = request.payload.url;
        const email = request.payload.email;
        // const email = request.auth.credentials.email;
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
            dataFromCache.email = await redisCache.getDataFromCache('email');
            console.log('dataFromCache', dataFromCache);
            // let res = await usermodel.findOne({attributes: ['id', 'accountId'], where: {email: email}});
            // console.log('Success in fetching user details');
            const userId = dataFromCache.userId;
            const accountId = dataFromCache.accountId;
            const tinyUrl = await generateId.generateId(6);
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
            let shortUrl = 'http://localhost:3010/'+setObject.tinyUrl;
            await emailQueue.sendMail(email, shortUrl);
            return reply.view(showMessageFile, { message: message });
        } catch (err) {
            console.error(err, 'Failure to create in Url Table');
            let message = `Failure to create in Url Table`;
            return reply.view(showMessageFile, { message: message });
        }
    }
}

module.exports.listAllShortenedUrls = async function (request, reply) {
    let email = request.payload.email;
    console.log('request', request);
    // const email = request.auth.credentials.email;
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
        let res = await tinyurlmodel.findAll({ attributes: ['originalUrl', 'tinyUrl'], where: {userId: userId, isActive: true} });
        let urlArray = [];
        console.log('Success in getting data from url Table');
        res.forEach((resp) => {
            urlArray.push(resp.dataValues);
        });
        console.log('urlArray', urlArray);
        urlArray.forEach((url) => {
            console.log('urls', url);
            redisCache.setDataToCache(url.tinyUrl, 3600, url.originalUrl);
        });
        reply(urlArray);
        // ejs.renderFile('./views/html/urlsList.html', { urlArray: urlArray }, {}, (err, str) => {
        //     if (err) {
        //         console.log('Error in rendering', err);
        //     } else {
        //         reply(str).header('Content-Type','text/html');
        //     }
        // });
    } catch (err) {
        console.error(err, 'Error in fetching url details');
        let message = `Error in fetching url details`;
        return reply.view(showMessageFile, { message: message });
    }
}

module.exports.redirectURL = async function(request, reply) {
    try {
        const { urlkey } = request.params;
        let origin_url = await redisCache.getDataFromCache(urlkey);
        reply(origin_url);
    } catch(err) {
        console.log('Error in getting url data', err);
        let message = 'Error in getting url data';
        return reply.view(showMessageFile, { message: message });
    }
}

module.exports.deleteURL = async function(request, reply) {
    try {
        const { urlkey } = request.params;
        await tinyurlmodel.update({ isActive: false }, {where: {tinyUrl:urlkey}, individualHooks: true});
        await redisCache.deleteDataFromCache(urlkey);
        console.log('Success in soft deleting url details');
        let message = 'Success in soft deleting url details';
        reply(message);
        // return reply.redirect(homeUrl);
    } catch(err) {
        console.log('Error in soft deleting url data', err);
        let message = 'Error in soft deleting url data';
        reply(message);
        // return reply.view(showMessageFile, { message: message });
    }
}
