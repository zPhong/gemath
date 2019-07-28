// @flow
import { observable } from 'mobx';
import GConst from '../utils/values';

export default class RelationInputModel {
  value: string = '';

  @observable
  status: string = GConst.InputStatus.NORMAL;
}
