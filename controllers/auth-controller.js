import AuthService from "../services/auth-service.js";
// import ApiError from "../exceptions/api-error.js";
// import { validationResult } from "express-validator";

class AuthController {
  static async register(req, res, next) {
    try {
      const userData = await AuthService.registration(req.body);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await AuthService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await AuthService.logout(refreshToken);

      res.clearCookie("refreshToken");

      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  static async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await AuthService.activate(activationLink);

      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await AuthService.refresh(refreshToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
}

export default AuthController;
