import { asyncHandler } from '../../utils/async-handler.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { USER } from '../../common/global.common.js';
import { StatusCodes } from 'http-status-codes';
import { User } from '../users/users.model.js';
import { Session } from '../sessions/sessions.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import { generatePublicId } from '../../common/functions.common.js';
import { generateTokens } from '../../utils/generateTokens.js';

// for registering user
export const signUpUser = asyncHandler(async (req, res) => {
  const { full_name, user_name, email, password } = req.body;

  if ([user_name, full_name, email, password].some((fields) => fields?.trim() === '')) {
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.ALL_FIELDS_ARE_REQUIRED, true));
  }

  //if user already exists
  const userExist = await User.findOne({ user_name: user_name, email: email });

  if (userExist) return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.ALREADY_EXIST, true));

  // local file path
  let profilePhotoLocalFile;

  if (req.file && req.file.path) {
    profilePhotoLocalFile = req.file.path;
    console.log('🚀 ~ profilePhotoLocalFile:', profilePhotoLocalFile);
  }

  // uploading the local file path using cloudinary
  const profilePhoto = await uploadOnCloudinary(profilePhotoLocalFile);
  console.log('🚀 ~ profilePhoto:', profilePhoto);

  //generating unique user Id's
  const userId = generatePublicId();

  // user creation query
  const newUser = await User.create({
    user_id: userId,
    user_name,
    full_name,
    email,
    password,
    profile_photo: profilePhoto?.url || '',
    created_at: Date.now(),
  });
  console.log('🚀 ~ newUser:', newUser);

  // generate JWT token
  const { accessToken, refreshToken } = await generateTokens(newUser);

  //create user sessions
  await Session.create({
    session_id: generatePublicId(),
    user_id: newUser.user_id,
    access_token: accessToken,
    refresh_token: refreshToken,
    device_ip: 'BACKEND-IP',
    user_agent: 'DELICIOUS-PLATE',
    created_at: Date.now(),
  });

  return res
    .status(StatusCodes.CREATED)
    .send(responseGenerators({ user: newUser, accessToken, refreshToken }, StatusCodes.CREATED, USER.REGISTERED, false));
});
