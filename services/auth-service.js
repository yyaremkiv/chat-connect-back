import User from "../models/user-model.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import mailService from "./mail-service.js";
import tokenService from "./token-service.js";
import UserDto from "../dtos/user-dto.js";
import ApiError from "../exceptions/api-error.js";

class AuthService {
  static async registration({ firstName, lastName, email, password }) {
    const candidate = await User.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(
        `A user with the email address ${email} already exists`
      );
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      activationLink,
    });
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  static async activate(activationLink) {
    const user = await UserModeL.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Invalid activation link");
    }
    user.isActivated = true;
    await user.save();
  }

  static async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest("A user with this email was not found");
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest("Incorrect password");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  static async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  static async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModeL.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }
}

export default AuthService;
