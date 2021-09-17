const Sequelize = require('sequelize');
const db = require('../config/database');

const Tinyurl = db.define('tinyurl', {
    id: {
        field: 'id',
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    originalUrl: {
        field: 'original_url',
        type: Sequelize.STRING
    },
    tinyUrl: {
        field: 'tiny_url',
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    isActive: {
        field: 'is_active',
        type: Sequelize.BOOLEAN
    },
    expiryDate: {
        field: 'expiry_date',
        type: Sequelize.DATE
    },
    userId: {
        field: 'user_id',
        type: Sequelize.INTEGER
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
    freezeTableName: true,
    hooks: {
        afterValidate: function() {
            console.log('AFTER Validate HOOK CALLED');
        }
    }
});

module.exports = Tinyurl;