import { asyncHandler } from '../../utils/async-handler.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { USER } from '../../common/global.common.js';
import { StatusCodes } from 'http-status-codes';
import { User } from './users.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import { generatePublicId } from '../../common/functions.common.js';

//register user
export const registerUser = asyncHandler(async (req, res) => {
  const { user_name, full_name, email, password, gender, bio } = req.body;

  if ([user_name, full_name, email, password, gender, bio].some((fields) => fields?.trim() === '')) {
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.ALL_FIELDS_ARE_REQUIRED, true));
  }

  //if user already exists
  const userExist = await User.findOne({ user_name: user_name, email: email });

  if (userExist) return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.ALREADY_EXIST, true));

  // local file path
  const profilePhotoLocalFile = req.file?.path;

  if (!profilePhotoLocalFile)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.PROFILE_PHOTO_REQUIRED, true));

  // uploading the local file path using cloudinary
  const profilePhoto = await uploadOnCloudinary(profilePhotoLocalFile);

  if (!profilePhoto)
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.PROFILE_PHOTO_REQUIRED, true));

  //generating unique user Id's
  const userId = generatePublicId();

  // user creation query
  const newUser = await User.create({
    user_id: userId,
    user_name,
    full_name,
    email,
    password,
    gender,
    bio,
    profile_photo: profilePhoto.url,
    created_at: Date.now(),
  });

  // removing specific field
  const createdUser = await User.findById(newUser._id).select('-password -refresh_token');

  if (!createdUser) return res.send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.INTERNAL_SERVER_ERROR, true));

  return res.status(StatusCodes.CREATED).send(responseGenerators({ newUser }, StatusCodes.CREATED, USER.CREATED, false));
});
