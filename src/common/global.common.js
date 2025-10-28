export const USER = {
  CREATED: 'User created successfully.',
  NOT_FOUND: 'User not found.',
  LOGGED_IN: 'logged in successfully, Welcome to Delicious Plate.',
  LOGOUT: 'You are successfully logout.',
  ALL_FIELDS_ARE_REQUIRED: 'All fields are required.',
  ALREADY_EXIST: 'User with this email is already exists. Please login.',
  INTERNAL_SERVER_ERROR: 'Something went wrong while registering the user.',
  USERNAME_PASSWORD_REQUIRED: 'Username and password is required cannot be empty. ',
  INCORRECT_PASSWORD: 'your password is incorrect. Please enter valid password.',
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
