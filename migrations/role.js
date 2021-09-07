const Sequelize = require('sequelize');
const up = async (sequelize) => {
    await sequelize.getQueryInterface().createTable('role', {
        id: {
            field: 'id',
            type: Sequelize.INTEGER,
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
    });
};

const down = async (sequelize) => {
    await sequelize.getQueryInterface().dropTable('role');
};

module.exports = {
    up,
    down
}