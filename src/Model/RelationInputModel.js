// @flow
import { observable } from 'mobx';
import { INPUT_ITEM_STATUS } from '../utils/values';

export default class RelationInputModel {
  value: string = '';

  @observable
  status: string = INPUT_ITEM_STATUS.NORMAL;
}
