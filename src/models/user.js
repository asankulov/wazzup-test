"use strict";

const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: DataTypes.STRING,
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Note);
    User.hasMany(models.Session);
  };

  User.beforeCreate((user, _) => {
    user.password = bcrypt.hashSync(user.password, 10);
  });

  User.prototype.comparePassword = function (attempt) {
    return bcrypt.compareSync(attempt, this.get("password"));
  };

  return User;
};
