// @flow

import * as ErrorMessage from './values';

const ErrorCode = {
  300: ErrorMessage.WRONG_FORMAT,
  301: ErrorMessage.MAXIMUM_POINT_ERROR,
  400: ErrorMessage.IMPOSSIBLE,
  401: ErrorMessage.INFINITY,
  500: ErrorMessage.NOT_BE_IN_LINE,
  501: ErrorMessage.NOT_ENOUGH_SET,
  502: ErrorMessage.TOO_SHORT
};

class ErrorHandleService {
  message: string = '';

  get ErrorMessage() {
    return this.message;
  }

  showError(code: string) {
    alert(ErrorCode[code]);
    throw ErrorCode;
  }
}

const ErrorService = new ErrorHandleService();

export default ErrorService;
