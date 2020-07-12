module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      primaryKey: true,
    },
    secret: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    redirectUri: {
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  Client.associate = (models) => {
    // associations can be defined here
  };

  return Client;
};