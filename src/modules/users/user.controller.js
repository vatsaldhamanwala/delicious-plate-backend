import { asyncHandler } from '../../utils/async-handler.js';
import { responseGenerators } from '../../utils/response-generators.js';
import { USER } from '../../common/global.common.js';
import { StatusCodes } from 'http-status-codes';

//register user
export const registerUser = asyncHandler(async (req, res) => {
  res.status(StatusCodes.OK).send(responseGenerators({}, StatusCodes.OK, USER.OK, false));
});
