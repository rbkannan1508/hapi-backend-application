const Sequelize = require('sequelize');
const up = async (sequelize) => {
    await sequelize.getQueryInterface().createTable('tinyurl', {
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
    });
};

const down = async (sequelize) => {
    await sequelize.getQueryInterface().dropTable('tinyurl');
};

module.exports = {
    up,
    down
}