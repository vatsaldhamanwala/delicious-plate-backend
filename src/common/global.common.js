export const USER = {
  CREATED: 'User created successfully.',
  NOT_FOUND: 'User not found.',
  FOUND: 'User successfully found.',
  UPDATED: 'User profile successfully updated.',
  DELETED: 'User deleted successfully.',
  LOGGED_IN: 'logged in successfully, Welcome to Delicious Plate.',
  LOGOUT: 'You are successfully logout.',
  ALL_FIELDS_ARE_REQUIRED: 'All fields are required.',
  ALREADY_EXIST: 'User with this email is already exists. Please login.',
  INTERNAL_SERVER_ERROR: 'Something went wrong while registering the user.',
  USERNAME_PASSWORD_REQUIRED: 'Username and password is required cannot be empty. ',
  INCORRECT_PASSWORD: 'Your password is incorrect. Please enter valid password.',
  INCORRECT_OLD_PASSWORD: 'Your old password is incorrect. Please enter valid old password for resetting new password.',
  INCORRECT_CONFIRM_PASSWORD: 'Your confirm password is incorrect. Please enter valid confirm password for resetting new password.',
  PASSWORD_CHANGE: 'Your password is successfully changed. Please login again with new password.',
  PROFILE_PHOTO_UPLOAD_ERROR: 'Failed to upload profile through cloudinary. Please try again.',
  PROFILE_PHOTO_NOT_FOUND: 'Cannot able to remove profile photo, because no profile found. ',
  ACCESS_DENIED: 'User is deleted and cannot access to this application.',
};

export const RECIPE = {
  ALL_FIELDS_ARE_REQUIRED: 'All fields are required.',
  CREATED: 'Recipe created successfully.',
  DRAFT_RECIPE_ALREADY_EXIST: 'Draft recipe is already exists. Please continue for posting recipe.',
};

export const TOKEN = {
  ERROR: 'Something went wrong while generating access and refresh token.',
  UNAUTHORIZED: 'Unauthorized access,  please provide valid token.',
  EXPIRED: 'Unauthorized access, token is expired, please login again.',
  REFRESH_TOKEN_ERROR: 'Unauthorized access, no token found, please provide valid refresh token or login again to get new token.',
  REFRESH_TOKEN_EXPIRED: 'Unauthorized access, refresh token is expired or used.',
  VERIFY_ERROR: 'Something went wrong while verifying tokens.',
  REFRESHED: 'Access token refreshed successfully.',
  INVALID_REFRESH_TOKEN: 'Unauthorized access, refresh token is invalid.',
};

export const ERROR = {
  INTERNAL_SERVER_ERROR: 'Internal server error, something went wrong while logging out from application.',
};
