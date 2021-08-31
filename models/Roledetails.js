const Sequelize = require('sequelize');
const db = require('../config/database');

const Roledetails = db.define('roledetails', {
    roleId: {
        field: 'role_id',
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    roleName: {
        field: 'role_name',
        type: Sequelize.STRING
    }
},{
    timestamps: false,
})

module.exports = Roledetails;