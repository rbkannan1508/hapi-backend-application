const Sequelize = require('sequelize');
const up = async (sequelize) => {
    await sequelize.getQueryInterface().createTable('user', {
        id: {
            field: 'id',
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
    await sequelize.getQueryInterface().dropTable('user');
};

module.exports = {
    up,
    down
}