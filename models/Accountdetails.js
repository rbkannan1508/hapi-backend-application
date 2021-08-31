const Sequelize = require('sequelize');
const db = require('../config/database');

const Accountdetails = db.define('accountdetails', {
    accountId: {
        field: 'account_id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    accountName: {
        field: 'account_name',
        type: Sequelize.STRING,
        unique: true
    }
},{
    timestamps: false,
})

module.exports = Accountdetails;