const { User, Session, sequelize } = require("../models");
let jwtHelper = require("../helpers/jwt");

module.exports = {
  async createNewUser(data) {
    const transaction = await sequelize.transaction();
    try {
      let user = await User.findOne({
        where: {
          username: data.username,
        },
        attributes: ["id"],
      });
      if (!!user) return Promise.reject("Username has already taken.");

      user = await User.create(data, { transaction, returning: ["id"] });
      const userId = user.get("id");
      const accessToken = await jwtHelper.generateNewToken({
        userId,
      });

      await Session.create(
        {
          userId,
          accessToken,
        },
        { transaction, returning: ["accessToken"] }
      );
      transaction.commit();

      return {
        accessToken,
      };
    } catch (e) {
      transaction.rollback();

      throw e;
    }
  },
  async processLogin(data) {
    try {
      const user = await User.findOne({
        where: {
          username: data.username,
        },
      });
      if (!user || !(await user.comparePassword(data.password))) {
        return Promise.reject("Invalid username/password.");
      }

      const userId = user.get("id");
      const accessToken = await jwtHelper.generateNewToken({
        userId,
      });

      await Session.create(
        {
          userId,
          accessToken,
        },
        {
          returning: ["accessToken"],
        }
      );

      return {
        accessToken,
      };
    } catch (e) {
      throw e;
    }
  },
  async revokeTokenByUserId(userId) {
    try {
      const destroyedNumber = await Session.destroy({
        where: {
          userId,
        },
      });

      return destroyedNumber > 0;
    } catch (e) {
      throw e;
    }
  },
};
