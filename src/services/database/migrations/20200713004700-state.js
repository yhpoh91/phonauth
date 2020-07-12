module.exports = {
  up: (queryInterface, Sequelize) => {
    const createStatesTable = () => queryInterface.createTable('States', {
      id: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      clientId: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(300),
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
      .then(createStatesTable);
  },
  down: (queryInterface) => {
    const dropStatesTable = () => queryInterface.dropTable('States');
    return Promise.resolve()
      .then(dropStatesTable);
  },
};