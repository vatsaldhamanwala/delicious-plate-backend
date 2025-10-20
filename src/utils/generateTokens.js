// import { User } from '../modules/users/users.model.js';
import { TOKEN } from '../common/global.common.js';
import { responseGenerators } from './response-generators.js';
import jwt from 'jsonwebtoken';

export const generateTokens = async (user) => {
  try {
    const payload = {
      user_id: user.user_id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new responseGenerators({}, StatusCodes.BAD_REQUEST, TOKEN.ERROR, true);
  }
};
