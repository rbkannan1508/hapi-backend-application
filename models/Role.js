const Sequelize = require('sequelize');
const db = require('../config/database');

const Role = db.define('role', {
    id: {
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    roleName: {
        field: 'role_name',
        type: Sequelize.STRING
    },
    accountId: {
        field: 'account_id',
        type: Sequelize.INTEGER
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

module.exports = Role;