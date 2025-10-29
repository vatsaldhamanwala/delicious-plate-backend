import { StatusCodes } from 'http-status-codes';
import { USER } from '../../common/global.common.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { User } from './users.model.js';
import { Session } from '../sessions/sessions.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';

//change user password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const userExist = await User.findOne({ user_id: req.user.user_id });

  if (!userExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USER.NOT_FOUND, true));

  const isValidPassword = await userExist.isPasswordCorrect(oldPassword);

  if (!isValidPassword)
    return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, USER.INCORRECT_OLD_PASSWORD, true));

  userExist.password = newPassword;

  if (!(newPassword === confirmPassword))
    return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, USER.INCORRECT_CONFIRM_PASSWORD, true));

  await userExist.save({ validateBeforeSave: false });

  await Session.updateMany({ session_author_id: userExist.user_id, is_expired: false }, { $set: { is_expired: true, updated_at: Date.now() } });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(StatusCodes.OK)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .send(responseGenerators({}, StatusCodes.OK, USER.PASSWORD_CHANGE, false));
});
// change user email

//get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userExist = await User.findOne({ user_id: req.user.user_id });
  console.log('user exist', userExist);

  if (!userExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USER.NOT_FOUND, true));

  return res.status(StatusCodes.OK).send(responseGenerators({ userExist }, StatusCodes.OK, USER.FOUND, false));
});

// get user by Id
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userExist = await User.findOne({ user_id: userId }).select('-password');
  console.log('user exist', userExist);

  if (!userExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USER.NOT_FOUND, true));

  return res.status(StatusCodes.OK).send(responseGenerators({ userExist }, StatusCodes.OK, USER.FOUND, false));
});

//update user profile

//delete user
