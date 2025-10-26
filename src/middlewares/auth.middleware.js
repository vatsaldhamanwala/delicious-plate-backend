import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/async-handler.js';
import { responseGenerators } from '../utils/response-generators.js';
import { ERROR } from '../common/global.common.js';
import jwt from 'jsonwebtoken';
import { Session } from '../modules/sessions/sessions.model.js';

export const verifyJWTToken = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    console.log('🚀 ~ token:', token);

    if (!token) return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, ERROR.UNAUTHORIZED));

    // jwt verification
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('🚀 ~ decodeToken:', decodeToken);

    // check user session exist
    const userSessionExist = await Session.findOne({
      access_token: token,
      session_author_id: decodeToken.user_id,
      is_expired: false,
    });
    console.log('🚀 ~ userSessionExist:', userSessionExist);

    if (!userSessionExist) return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, ERROR.EXPIRED, true));

    req.user = decodeToken;
    req.session = userSessionExist;

    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, ERROR.INVALID, true));
  }
});
