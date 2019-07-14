// @flow
import { observable } from 'mobx';
import { INPUT_ITEM_STATUS } from '../utils/values';

export default class RelationInput {
  value: string = '';

  @observable
  status: string = INPUT_ITEM_STATUS.NORMAL;
}
