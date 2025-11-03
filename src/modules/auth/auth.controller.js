import { asyncHandler } from '../../utils/async-handler.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { ERROR, TOKEN, USER } from '../../common/global.common.js';
import { StatusCodes } from 'http-status-codes';
import { User } from '../users/users.model.js';
import { Session } from '../sessions/sessions.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import { generatePublicId } from '../../common/functions.common.js';
import { generateTokens } from '../../utils/generateTokens.js';
import jwt from 'jsonwebtoken';

// registering user
export const signUpUser = asyncHandler(async (req, res) => {
  const { full_name, user_name, email, password } = req.body;

  if ([user_name, full_name, email, password].some((fields) => fields?.trim() === '')) {
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.ALL_FIELDS_ARE_REQUIRED, true));
  }

  //if user already exists
  const userExist = await User.findOne({ user_name: user_name, email: email });

  if (userExist) return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.ALREADY_EXIST, true));

  // local file path
  // let profilePhotoLocalFile;

  // if (req.file && req.file.path) {
  //   profilePhotoLocalFile = req.file.path;
  //   console.log('🚀 ~ profilePhotoLocalFile:', profilePhotoLocalFile);
  // }

  // uploading the local file path using cloudinary
  // const profilePhoto = await uploadOnCloudinary(profilePhotoLocalFile);
  // console.log('🚀 ~ profilePhoto:', profilePhoto);

  //generating unique user Id's

  let profilePhoto = { url: '', public_id: '' };
  let profilePhotoLocalFile;

  if (req.file && req.file.path) {
    profilePhotoLocalFile = req.file.path;
  }

  const uploadedPhoto = await uploadOnCloudinary(profilePhotoLocalFile);

  if (uploadedPhoto?.url && uploadedPhoto.public_id) {
    profilePhoto = {
      url: uploadedPhoto.url || '',
      public_id: uploadedPhoto.public_id || '',
    };
  }

  const userId = generatePublicId();

  // user creation query
  const newUser = await User.create({
    user_id: userId,
    user_name,
    full_name,
    email,
    password,
    profile_photo: profilePhoto,
    created_at: Date.now(),
  });
  console.log('🚀 ~ newUser:', newUser);

  // generate JWT token
  const { accessToken, refreshToken } = await generateTokens({ user_id: newUser.user_id });

  //create user sessions
  await Session.create({
    session_id: generatePublicId(),
    session_author_id: newUser.user_id,
    access_token: accessToken,
    refresh_token: refreshToken,
    device_ip: 'BACKEND-IP',
    user_agent: 'DELICIOUS-PLATE',
    created_at: Date.now(),
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(StatusCodes.CREATED)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .send(responseGenerators({ user: newUser, accessToken, refreshToken }, StatusCodes.CREATED, USER.REGISTERED, false));
});

// login user
export const loginUser = asyncHandler(async (req, res) => {
  // req.body -> username , password
  const { user_name: userName, password } = req.body;

  // check username and password field is not empty
  if (!(userName || password))
    return res.status(StatusCodes.BAD_REQUEST).send(responseGenerators({}, StatusCodes.BAD_REQUEST, USER.USERNAME_PASSWORD_REQUIRED, true));

  // find user by email and username
  const userExist = await User.findOne({ user_name: userName, is_deleted: false });

  if (!userExist) return res.status(StatusCodes.NOT_FOUND).send(responseGenerators({}, StatusCodes.NOT_FOUND, USER.NOT_FOUND, true));

  // check user password
  const isValidPassword = await userExist.isPasswordCorrect(password);

  if (!isValidPassword)
    return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, USER.INCORRECT_PASSWORD, true));

  await Session.updateMany({ session_author_id: userExist.user_id, is_expired: false }, { $set: { is_expired: true, expired_at: Date.now() } });

  // generate tokens
  const { accessToken, refreshToken } = await generateTokens({ user_id: userExist.user_id });

  await Session.create({
    session_id: generatePublicId(),
    session_author_id: userExist.user_id,
    access_token: accessToken,
    refresh_token: refreshToken,
    device_ip: 'BACKEND-IP',
    user_agent: 'DELICIOUS-PLATE',
    created_at: Date.now(),
  });

  // set security for cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // generate response
  return res
    .status(StatusCodes.OK)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .send(responseGenerators({ user: userExist, accessToken, refreshToken }, StatusCodes.OK, USER.LOGGED_IN, false));
});

// logout user
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    const { user_id } = req.user;
    const { access_token } = req.session;

    await Session.updateOne({ session_author_id: user_id, access_token }, { $set: { is_expired: true, updated_at: Date.now() } });

    // set security for cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(StatusCodes.OK)
      .clearCookie('accessToken', options)
      .clearCookie('refreshToken', options)
      .send(responseGenerators({}, StatusCodes.OK, USER.LOGOUT, false));
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send(responseGenerators({ error }, StatusCodes.INTERNAL_SERVER_ERROR, ERROR.INTERNAL_SERVER_ERROR, true));
  }
});

//refresh token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  console.log('🚀 ~ incomingRefreshToken:', incomingRefreshToken);

  if (!incomingRefreshToken)
    return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, TOKEN.REFRESH_TOKEN_ERROR));

  try {
    const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log('🚀 ~ decodeToken:', decodeToken);

    const userSessionExist = await Session.findOne({
      session_author_id: decodeToken.user_id,
      refresh_token: incomingRefreshToken,
      is_expired: false,
    });
    console.log('🚀 ~ userSessionExist:', userSessionExist);

    if (!userSessionExist) return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, TOKEN.EXPIRED, true));

    if (incomingRefreshToken !== userSessionExist.refresh_token)
      return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({}, StatusCodes.UNAUTHORIZED, TOKEN.REFRESH_TOKEN_EXPIRED, true));

    const { accessToken, refreshToken } = await generateTokens({
      user_id: userSessionExist.session_author_id,
    });
    console.log('🚀 ~ newRefreshToken:', refreshToken);
    console.log('🚀 ~ access_token:', accessToken);

    await Session.updateOne(
      { session_author_id: decodeToken.user_id, is_expired: false },
      { $set: { access_token: accessToken, refresh_token: refreshToken, updated_at: Date.now() } }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(StatusCodes.OK)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .send(responseGenerators({ accessToken, refreshToken }, StatusCodes.OK, TOKEN.REFRESHED, false));
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).send(responseGenerators({ error }, StatusCodes.UNAUTHORIZED, TOKEN.INVALID_REFRESH_TOKEN, true));
  }
});
