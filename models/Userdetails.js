const Sequelize = require('sequelize');
const db = require('../config/database');

const Userdetails = db.define('userdetails', {
    userId: {
        field: 'user_id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userName: {
        field: 'username',
        type: Sequelize.STRING
    },
    phone: {
        field: 'phone',
        type: Sequelize.STRING
    },
    email: {
        field: 'email',
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        field: 'password',
        type: Sequelize.STRING
    },
    roleId: {
        field: 'role_id',
        type: Sequelize.INTEGER
    },
    accountId: {
        field: 'account_id',
        type: Sequelize.INTEGER
    }
},{
    timestamps: false,
})

module.exports = Userdetails;