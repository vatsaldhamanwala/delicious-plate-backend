// error -> statusCode, message, error

import { StatusCodes } from 'http-status-codes';

export function apiError(errorStatusCode, errorStatusMessage, generatedError) {
  const errorJson = {};

  errorJson.success = false;
  errorJson.statusCode = errorStatusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  errorJson.message = errorStatusMessage || 'Internal Server Error';
  errorJson.error = generatedError === undefined ? [] : generatedError;

  return errorJson;
}
