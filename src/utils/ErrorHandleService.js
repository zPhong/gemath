// @flow

import GConst from './values';
import dataViewModel from '../ViewModel/DataViewModel';
import RelationInputModel from '../Model/RelationInputModel';

const ErrorCode = {
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
      index = dataViewModel.inputData.filter((data: mixed): boolean => data === errorRelation)[0];
    } else {
      index = dataViewModel.executedInputIndex;
    }
    if (index >= 0) {
      dataViewModel.RelationsInput[index].status = GConst.InputStatus.ERROR;
    }

    alert(ErrorCode[code]);
    throw ErrorCode[code];
  }
}

const ErrorService = new ErrorHandleService();

export default ErrorService;
