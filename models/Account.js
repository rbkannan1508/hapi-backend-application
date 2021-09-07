const Sequelize = require('sequelize');
const db = require('../config/database');

const Account = db.define('account', {
    id: {
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    accountName: {
        field: 'account_name',
        type: Sequelize.STRING,
        unique: true
    },
    createdAt: {
        field: 'created_at',
        type: Sequelize.DATE
    },
    updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE
    },
    deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE
    }
},{
    freezeTableName: true
})

module.exports = Account;