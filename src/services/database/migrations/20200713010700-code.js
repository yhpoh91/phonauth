module.exports = {
  up: (queryInterface, Sequelize) => {
    const createCodesTable = () => queryInterface.createTable('Codes', {
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
      code: {
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
      .then(createCodesTable);
  },
  down: (queryInterface) => {
    const dropCodesTable = () => queryInterface.dropTable('Codes');
    return Promise.resolve()
      .then(dropCodesTable);
  },
};