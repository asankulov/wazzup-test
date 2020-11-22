const authService = require("../../services/auth");

module.exports = {
  async signUp(req, res) {
    try {
      const tokenResult = await authService.createNewUser(req.body);

      return res.status(201).json(tokenResult);
    } catch (error) {
      if (error === "Username has already taken.") {
        return res.status(400).json({
          message: error,
        });
      }

      throw error;
    }
  },
  async signIn(req, res) {
    try {
      const tokenResult = await authService.processLogin(req.body);

      return res.status(200).json(tokenResult);
    } catch (error) {
      if (error === "Invalid username/password.") {
        return res.status(400).json({
          message: error,
        });
      }

      throw error;
    }
  },
  async signOut(req, res) {
    try {
      const result = await authService.revokeTokenByUserId(req.user.userId);
      if (result) return res.sendStatus(200);

      return res.status(400).json({
        message: "Already logout.",
      });
    } catch (error) {
      throw error;
    }
  },
};
