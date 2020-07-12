module.exports = {
  up: (queryInterface, Sequelize) => {
    const addUserId = () => queryInterface.addColumn('Codes', 'userId', {
      type: Sequelize.STRING(45),
      allowNull: true,
    });
    return Promise.resolve()
      .then(addUserId);
  },
  down: (queryInterface) => {
    const removeUserId = () => queryInterface.removeColumn('Codes', 'userId');
    return Promise.resolve()
      .then(removeUserId);
  },
};