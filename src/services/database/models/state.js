module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', {
    id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    redirectUri: {
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  State.associate = (models) => {
    // associations can be defined here
  };

  return State;
};