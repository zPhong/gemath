// @flow

import * as React from 'react';
import './InputItem.scss';
import { Icon } from '../index';
import color from '../../../utils/color.scss';
import autobind from 'autobind-decorator';
type PropsType = {
  value: string,
  status: string,
  onValueChange: void,
  onSubmit: void,
  onBackspace: void
};

const KEYCODE = Object.freeze({
  BACKSPACE: 8,
  ENTER: 13,
});

class InputItem extends React.Component<PropsType> {
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
    if (onValueChange) {
      onValueChange(value);
    }
  }

  @autobind
  onKeyUp(e: React.KeyboardEvent<FormControl>) {
    const { onBackspace, onSubmit } = this.props;

    if (e.keyCode === KEYCODE.ENTER) {
      if (onSubmit) {
        onSubmit();
      }
    }

    else if (e.keyCode === KEYCODE.BACKSPACE) {
      if (onBackspace) {
        onBackspace();
      }
    }
  }
  render(): React.Node {
    const { status } = this.props;
    return (
      <div className="input-item">
        <div className="input-group input-container">
          <div className="input-group-prepend input-status">
            <span className={`input-group-text ${status.toLowerCase()}`} id="basic-addon1">
              <Icon width={15} height={15} name={`input${status}`} color={color[`input${status}`]} />
            </span>
          </div>
          <input
            type="text"
            ref={this.inputRef}
            onChange={this.onChange}
            onKeyUp={this.onKeyUp}
            className={`form-control ${status.toLowerCase()}`}
            aria-describedby="basic-addon1"
          />
        </div>
      </div>
    );
  }
}

export default InputItem;
