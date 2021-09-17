const usermodel = require('../models/User');
const tinyurlmodel = require("../models/Tinyurl");
const redisCache = require('../helpers/redisCache');
const generateId = require('../helpers/generateId');
const { addQueue } = require('../helpers/emailQueue');
const { checkIndices, saveSearchData, getSearchData } = require('../helpers/elasticSearch');

module.exports.tinyurl = async function (request, reply) {
    await reply.file('./views/html/tinyurl.html');
}

module.exports.shortenurl = async function (request, reply) {
    const originalUrl = request.payload.url;
    const email = request.payload.email;
    const setObject = {};
    try {
        const key = 'userDetails_' + email;
        const userDetails = JSON.parse(await redisCache.getDataFromCache(key));
        const userId = userDetails.userId;
        const accountId = userDetails.accountId;
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

        await tinyurlmodel.create({ 
            originalUrl: setObject.originalUrl, 
            tinyUrl: setObject.tinyUrl, 
            isActive: setObject.isActive, 
            expiryDate: setObject.expiryDate,
            userId: setObject.userId, 
            accountId: setObject.accountId });
        const message = "URL insert Success";
        console.log('Success in creating url details');
        const shortUrl = setObject.tinyUrl;
        const data = {
            email: 'bharathi.kannan@surveysparrow.com',
            shortUrl: shortUrl
        };

        await checkIndices();
        await saveSearchData(setObject.originalUrl, setObject.tinyUrl);

        // await addQueue(data);
        
        reply(message).code(200);
    } catch (err) {
        console.error(err);
        const data = {
            message: 'API Failure'
        }
        reply(data).code(500);
    }
}

module.exports.listAllShortenedUrls = async function (request, reply) {
    const email = request.payload.email;
    let userId;
    try {
        const res = await usermodel.findOne({ attributes: ['id'], where: {email: email} });
        userId = res.id;
        console.log('Success in getting data from User Table', userId);

        const response = await tinyurlmodel.findAll({ attributes: ['originalUrl', 'tinyUrl'], where: {userId: userId, isActive: true} });
        let urlArray = [];
        console.log('Success in getting data from url Table');
        response.forEach((resp) => {
            urlArray.push(resp.dataValues);
        });
        urlArray.forEach((url) => {
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
        const origin_url = await redisCache.getDataFromCache(urlkey);
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
        const search_result = await getSearchData(inputValue);
        reply(search_result).code(200);
    } catch(err) {
        console.log('Error in fetching url data', err);
        const data = {
            message: 'API Failure'
        }
        reply(data + err).code(500);
    }
}
