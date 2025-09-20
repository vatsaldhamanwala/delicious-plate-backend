// catch -> statusCode and message
import { StatusCodes } from 'http-status-codes';

export function catchError() {
  const catchErrorJson = {};

  catchErrorJson.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  catchErrorJson.message = 'Internal Server Error';

  return catchErrorJson;
}
