import ApiError from "../exceptions/api-error.js";
import tokenService from "../services/token-service.js";

export default function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const user = tokenService.validateAccessToken(accessToken);
    if (!user) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = user;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}
