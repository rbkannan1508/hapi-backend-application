const redis = require('redis');
const config = require('config');
const client = redis.createClient(config.get('redis.port'));

const setDataToCache = (key, expiry_time, value) => {
    client.setex(key, expiry_time, value);
}

const getDataFromCache = (fetchData) => {
    return new Promise(resolve => {
        client.get(fetchData, (err, data) => {
            if(err) {
                throw err;
            }
            console.log('data', data);
            resolve(data);
        });
    });
}

module.exports = {
    setDataToCache,
    getDataFromCache
}