const Sequelize = require('sequelize');
const up = async (sequelize) => {
    await sequelize.getQueryInterface().createTable('account', {
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
    });
};

const down = async (sequelize) => {
    await sequelize.getQueryInterface().dropTable('account');
};

module.exports = {
    up,
    down
}