module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING(45),
      allowNull: false,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  User.associate = (models) => {
    // associations can be defined here
  };

  return User;
};