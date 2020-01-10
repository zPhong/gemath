// @flow
import { observable } from 'mobx';
import GConst from '../core/config/values';

export default class RelationInputModel {
  @observable
  value: string = '';

  @observable
  status: string = GConst.InputStatus.NORMAL;

  constructor(value: string) {
    this.value = value || '';
  }
}
