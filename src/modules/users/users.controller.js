import { StatusCodes } from 'http-status-codes';
import { USER } from '../../common/global.common.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { User } from './users.model.js';
import { Session } from '../sessions/sessions.model.js';
import { deleteOldFileFromCloudinary, uploadOnCloudinary } from '../../utils/cloudinary.js';

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
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { full_name, user_name, bio, gender, remove_current_photo } = req.body;

  const userExist = await User.findOne({ user_id: req.user.user_id });

  if (!userExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USER.NOT_FOUND, true));

  let profilePhotoUrl = userExist.profile_photo?.url || '';
  let profilePhotoPublicId = userExist.profile_photo.public_id || '';
  let profilePhotoLocalFile;

  // user only want to remove current profile photo
  if (remove_current_photo === 'true' || remove_current_photo === true) {
    if (profilePhotoPublicId) {
      await deleteOldFileFromCloudinary(profilePhotoPublicId);
    }

    profilePhotoUrl = '';
    profilePhotoPublicId = '';
  }

  //user want to upload new profile photo
  if (req.file && req.file.path) {
    profilePhotoLocalFile = req.file.path;
  }

  //delete old photo
  if (profilePhotoPublicId) {
    await deleteOldFileFromCloudinary(profilePhotoPublicId);
  }

  //upload new profile photo
  const uploadedPhoto = await uploadOnCloudinary(profilePhotoLocalFile);

  if (uploadedPhoto?.url && uploadedPhoto?.public_id) {
    profilePhotoUrl = uploadedPhoto.url;
    profilePhotoPublicId = uploadedPhoto.public_id;
  }

  await User.findOneAndUpdate(
    { user_id: userExist.user_id },
    { $set: { full_name, user_name, profile_photo: { url: profilePhotoUrl, public_id: profilePhotoPublicId }, bio, gender, updated_at: Date.now() } }
  );

  return res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, USER.UPDATED, false));
});

//delete user
