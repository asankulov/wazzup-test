"use strict";

module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define(
    "Note",
    {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isShared: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "notes",
      timestamps: true,
    }
  );

  Note.associate = (models) => {
    Note.belongsTo(models.User);
  };

  return Note;
};
