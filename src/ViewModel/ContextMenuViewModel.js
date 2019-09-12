//@flow

import { observable, action, computed } from 'mobx';
import autobind from 'autobind-decorator';

class ContextMenuViewModel {
  @observable
  isContextShow: boolean = false;

  @observable
  currentInputIndex: number = null;

  @action
  showContextMenu() {
    this.isContextShow = true;
  }
  @action
  hideContextMenu() {
    this.isContextShow = false;
  }
}

export default new ContextMenuViewModel();
