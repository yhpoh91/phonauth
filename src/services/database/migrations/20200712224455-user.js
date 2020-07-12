module.exports = {
  up: (queryInterface, Sequelize) => {
    const createUsersTable = () => queryInterface.createTable('Users', {
      id: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(500),
        allowNull: true,
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
      .then(createUsersTable);
  },
  down: (queryInterface) => {
    const dropUsersTable = () => queryInterface.dropTable('Users');
    return Promise.resolve()
      .then(dropUsersTable);
  },
};