//response->data, statusCode, statusMessage, error (passed as parameter)

import { StatusCodes } from 'http-status-codes';

export function responseGenerators(responseData, responseStatusCode, responseStatusMessage, responseError) {
  const responseJson = {};

  responseJson?.data = responseData || null;
  responseJson?.statusCode = responseStatusCode || StatusCodes.OK;
  responseJson?.message = responseStatusMessage || 'OK';
  responseJson?.error = responseError === undefined ? [] : responseError;

  return responseJson;
}
