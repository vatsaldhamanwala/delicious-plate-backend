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
};

export const ERROR = {
  INVALID: 'Unauthorized access, invalid token.',
  UNAUTHORIZED: 'Unauthorized access, no token found or please provide valid token.',
  EXPIRED: 'Unauthorized access, token is expired, please login again.',
};
