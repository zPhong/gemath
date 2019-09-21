// @flow

import GConst from '../core/config/values';
import dataViewModel from '../ViewModel/DataViewModel';

const ErrorCode = {
  200: GConst.Errors.UNDEFINED_ERROR,
  300: GConst.Errors.WRONG_FORMAT,
  301: GConst.Errors.MAXIMUM_POINT_ERROR,
  400: GConst.String.IMPOSSIBLE,
  401: GConst.String.INFINITY,
  500: GConst.String.NOT_BE_IN_LINE,
  501: GConst.String.NOT_ENOUGH_SET,
  502: GConst.String.TOO_SHORT
};

class ErrorHandleService {
  message: string = '';

  get ErrorMessage() {
    return this.message;
  }

  showError(code: string, errorRelation?: mixed) {
    let index;
    if (errorRelation) {
      dataViewModel.inputData.forEach((data: mixed, i: number) => {
        if (data === errorRelation) {
          index = i;
        }
      });
    } else {
      switch (code) {
        case 300:
        case 301:
          index = dataViewModel.executedInputIndex;
          break;
        default:
          index = dataViewModel.inputData.filter((data: mixed): boolean => data === dataViewModel.executingRelation)[0];
      }
    }
    if (index >= 0) {
      dataViewModel.RelationsInput[index].status = GConst.InputStatus.ERROR;
    }

    alert(ErrorCode[code]);
    throw console.error('error', ErrorCode[code]);
  }

  updateErrorInInput(errorRelation: mixed) {
    let index;
    if (errorRelation) {
      dataViewModel.inputData.forEach((data: mixed, i: number) => {
        if (data === errorRelation) {
          index = i;
        }
      });
    }
    if (index >= 0) {
      dataViewModel.RelationsInput[index].status = GConst.InputStatus.ERROR;
    }
  }
}

const ErrorService = new ErrorHandleService();

export default ErrorService;
