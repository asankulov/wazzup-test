"use strict";

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    "Session",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      accessToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "sessions",
      timestamps: false,
    }
  );

  Session.associate = function (models) {
    Session.belongsTo(models.User);
  };

  return Session;
};
