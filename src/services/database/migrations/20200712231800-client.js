module.exports = {
  up: (queryInterface, Sequelize) => {
    const createClientsTable = () => queryInterface.createTable('Clients', {
      id: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      secret: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      redirectUri: {
        type: Sequelize.STRING(2000),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    return Promise.resolve()
      .then(createClientsTable);
  },
  down: (queryInterface) => {
    const dropClientsTable = () => queryInterface.dropTable('Clients');
    return Promise.resolve()
      .then(dropClientsTable);
  },
};