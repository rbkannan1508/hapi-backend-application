const usermodel = require('../models/User');
const tinyurlmodel = require("../models/Tinyurl");
const redisCache = require('../helpers/redisCache');
const generateId = require('../helpers/generateId');
const emailQueue = require('../helpers/emailQueue');

module.exports.tinyurl = async function (request, reply) {
    await reply.file('./views/html/tinyurl.html');
}

module.exports.shortenurl = async function (request, reply) {
    if(request) {
        const originalUrl = request.payload.url;
        const email = request.payload.email;
        const setObject = {};
        try {
            const dataFromCache = {};
            dataFromCache.accountId = await redisCache.getDataFromCache('accountId');
            dataFromCache.userId = await redisCache.getDataFromCache('userId');
            dataFromCache.email = await redisCache.getDataFromCache('email');
            console.log('dataFromCache', dataFromCache);
            const userId = dataFromCache.userId;
            const accountId = dataFromCache.accountId;
            const tinyUrl = await generateId.generateId(6);
            const isActive = true;
            const someDate = new Date();
            const numberOfDaysToAdd = 1;
            const expiryDate = new Date(someDate.setDate(someDate.getDate() + numberOfDaysToAdd)); 
            setObject.originalUrl = originalUrl;
            setObject.tinyUrl = tinyUrl;
            setObject.isActive = isActive;
            setObject.expiryDate = expiryDate;
            setObject.userId = userId;
            setObject.accountId = accountId;
            console.log('setObject', setObject);
        } catch (err) {
            console.error(err, 'Failure to get data from User Table');
            const data = {
                message: 'API Failure'
            }
            reply(data).code(500);
        }
        try {
            await tinyurlmodel.create({ originalUrl: setObject.originalUrl, tinyUrl: setObject.tinyUrl, isActive: setObject.isActive, expiryDate: setObject.expiryDate,
                userId: setObject.userId, accountId: setObject.accountId });
            const message = "URL insert Success";
            console.log('Success in creating url details');
            const shortUrl = 'http://localhost:3010/redirect/'+setObject.tinyUrl;
            await emailQueue.sendMail(email, shortUrl);
            return reply(message).code(200);
        } catch (err) {
            console.error(err, 'Failure to create in Url Table');
            const data = {
                message: 'API Failure'
            }
            reply(data).code(500);
        }
    }
}

module.exports.listAllShortenedUrls = async function (request, reply) {
    const email = request.payload.email;
    console.log('request', request);
    let userId;
    try {
        const res = await usermodel.findOne({ attributes: ['id'], where: {email: email} });
        userId = res.dataValues.id;
        console.log('Success in getting data from User Table');
        console.log('userId', userId);
    } catch (err) {
        console.error(err, 'Error in fetching user details');
        const data = {
            message: 'API Failure'
          }
        reply(data + err).code(500);
    }
    try {
        const res = await tinyurlmodel.findAll({ attributes: ['originalUrl', 'tinyUrl'], where: {userId: userId, isActive: true} });
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
        reply(urlArray).code(200);
    } catch (err) {
        console.error(err, 'Error in fetching url details');
        const data = {
            message: 'API Failure'
          }
        reply(data + err).code(500);
    }
}

module.exports.redirectURL = async function(request, reply) {
    try {
        const { urlkey } = request.params;
        let origin_url = await redisCache.getDataFromCache(urlkey);
        reply(origin_url).code(200);
    } catch(err) {
        console.log('Error in getting url data', err);
        const data = {
            message: 'API Failure'
        }
        reply(data + err).code(500);
    }
}

module.exports.deleteURL = async function(request, reply) {
    try {
        const { urlkey } = request.params;
        await tinyurlmodel.update({ isActive: false }, {where: {tinyUrl:urlkey}, individualHooks: true});
        await redisCache.deleteDataFromCache(urlkey);
        console.log('Success in soft deleting url details');
        const message = 'Success in soft deleting url details';
        reply(message).code(200);
    } catch(err) {
        console.log('Error in soft deleting url data', err);
        const data = {
            message: 'API Failure'
        }
        reply(data + err).code(500);
    }
}

module.exports.searchURL = async function(request, reply) {
    try {
        const { inputValue } = request.params;
        console.log('inputValue', inputValue);
        reply(inputValue).code(200);
    } catch(err) {
        console.log('Error in fetching url data', err);
        const data = {
            message: 'API Failure'
        }
        reply(data + err).code(500);
    }
}
