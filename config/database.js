const Sequelize = require('sequelize');
const config = require('config');

const dbName = config.get('dbConfig.dbName');
const username = config.get('dbConfig.username');
const host = config.get('dbConfig.host');
module.exports = new Sequelize(dbName, username, '', {
    host: host,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
});