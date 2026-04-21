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
  static async getMyProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password", "googleId"] },
        include: [
          {
            model: require("../models").TasteDNA,
            as: "TasteDNA",
            attributes: ["content", "generatedAt"],
          },
        ],
      });

      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async updatedMyProfile(req, res, next) {
    try {
      const { bio } = req.body;

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw { name: "NotFound", message: "User not found" };
      }

      await user.update({ bio });
      res.status(200).json({
        message: "Profile updated successfully",
        bio: user.bio,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyAvatar(req, res, next) {
    try {
      res.status(501).json({
        message: "Avatar upload not yet implemented",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
