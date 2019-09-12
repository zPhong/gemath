// @flow

import * as React from 'react';
import './InputItem.scss';
import { Icon } from '../index';
import color from '../../../utils/color.scss';
import autobind from 'autobind-decorator';
import { observer } from 'mobx-react';
import ContextMenuViewModel from '../../../ViewModel/ContextMenuViewModel';
import dataViewModel from '../../../ViewModel/DataViewModel';
import RelationInputModel from '../../../Model/RelationInputModel';

type PropsType = {
  index: number,
  value: string,
  status: string,
  onValueChange: void,
  onSubmit: void,
  onBackspace: void
};

type StateType = {
  shouldRemove: boolean,
  isEmpty: boolean,
  popupX: number,
  popupY: number
};

const KEYCODE = Object.freeze({
  BACKSPACE: 8,
  ENTER: 13
});

@observer
class InputItem extends React.Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.state = {
      shouldRemove: true,
      isEmpty: true,
      popupX: 0,
      popupY: 0
    };
  }
  inputRef: ReactRefs = React.createRef();

  focus() {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  @autobind
  onChange(e: React.FormEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    const { onValueChange } = this.props;

    if (value.length === 0) {
      if (!this.state.isEmpty) {
        this.setState({ isEmpty: true });
      }
    } else {
      this.setState({
        isEmpty: false,
        shouldRemove: false
      });
    }
    if (onValueChange) {
      onValueChange(value);
    }
  }

  @autobind
  onKeyUp(e: React.KeyboardEvent<FormControl>) {
    const { onBackspace, onSubmit, value } = this.props;

    if (e.keyCode === KEYCODE.ENTER) {
      if (onSubmit) {
        onSubmit();
      }
    } else if (e.keyCode === KEYCODE.BACKSPACE) {
      if (this.state.isEmpty && !this.state.shouldRemove) {
        this.setState({
          shouldRemove: true
        });
        return;
      }
      if (onBackspace) {
        onBackspace();
      }
    }
  }

  @autobind
  handleClose() {
    ContextMenuViewModel.hideContextMenu();
    ContextMenuViewModel.currentInputIndex = null;
  }

  @autobind
  onOpenContextMenu(e: SyntheticEvent) {
    e.preventDefault();
    e.persist();
    ContextMenuViewModel.hideContextMenu();
    ContextMenuViewModel.currentInputIndex = this.props.index;
    setTimeout(() => {
      ContextMenuViewModel.showContextMenu();
      this.setState({ popupX: e.pageX, popupY: e.clientY });
    }, 100);
    return false;
  }

  @autobind
  onAddInputBefore() {
    const { index } = this.props;
    dataViewModel.RelationsInput.splice(index, 0, new RelationInputModel());
    this.handleClose();
  }

  @autobind
  onDeleteInput() {
    const { index } = this.props;
    dataViewModel.removeInput(index);
    this.handleClose();
  }

  @autobind
  renderContextMenu(): React.Node {
    const { isContextShow, currentInputIndex } = ContextMenuViewModel;
    if (!isContextShow || currentInputIndex !== this.props.index) {
      return;
    }
    return (
      <div className="context-menu" style={{ left: this.state.popupX, top: this.state.popupY }}>
        <div onMouseDown={this.onAddInputBefore} className="context-menu-item">
          <Icon name="icAdd" width={30} height={30} color="black" />
          <p>Thêm dòng phía trên</p>
        </div>
      </div>
    );
  }

  render(): React.Node {
    const { status, value } = this.props;
    return (
      <div className="input-item">
        {this.renderContextMenu()}
        <div onContextMenu={this.onOpenContextMenu} className="input-group input-container">
          <div className="input-remove-btn" onClick={this.onDeleteInput}>
            <Icon name="inputError" width={10} height={10} color={'#7f8c8d'} />
          </div>
          <div className="input-group-prepend input-status">
            <span className={`input-group-text ${status.toLowerCase()}`} id="basic-addon1">
              <Icon width={15} height={15} name={`input${status}`} color={color[`input${status}`]} />
            </span>
          </div>
          <input
            type="text"
            onBlur={this.handleClose}
            onClick={this.handleClose}
            ref={this.inputRef}
            onChange={this.onChange}
            onKeyUp={this.onKeyUp}
            value={value}
            className={`form-control ${status.toLowerCase()}`}
            aria-describedby="basic-addon1"></input>
        </div>
      </div>
    );
  }
}

export default InputItem;
