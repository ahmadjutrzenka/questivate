const { User, TasteDNA } = require("../models");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({ where: { email } });

      if (existingUser && existingUser.loginMethod === "google") {
        throw {
          name: "BadRequest",
          message:
            "Email already registered via Google. Please sign in with Google.",
        };
      }

      const user = await User.create({
        username,
        email,
        password,
        loginMethod: "local",
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        loginMethod: user.loginMethod,
      });
    } catch (error) {
      next(error);
    }
  }
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw { name: "BadRequest", message: "Email is required" };
      }
      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }

      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }

      if (user.loginMethod === "google") {
        throw {
          name: "Unauthorized",
          message:
            "This account uses Google sign-in. Please sign in with Google.",
        };
      }

      const checkPassword = comparePassword(password, user.password);

      if (!checkPassword) {
        throw { name: "Unauthorized", message: "Invalid email or password" };
      }

      const access_token = signToken({
        id: user.id,
        email: user.email,
      });
      res.status(200).json({
        access_token: access_token,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
