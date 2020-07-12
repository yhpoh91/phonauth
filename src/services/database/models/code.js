module.exports = (sequelize, DataTypes) => {
  const Code = sequelize.define('Code', {
    id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    code: {
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

  Code.associate = (models) => {
    // associations can be defined here
  };

  return Code;
};