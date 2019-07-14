// @flow

import * as React from 'react';
import './InputItem.scss';
import { Icon } from '../index';
import color from '../../../utils/color.scss';

type PropsType = {
  value: string,
  status: string,
  onValueChange: void,
  onSubmit: void
};

class InputItem extends React.Component<PropsType> {
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
          <input type="text" className={`form-control ${status.toLowerCase()}`} aria-describedby="basic-addon1" />
        </div>
      </div>
    );
  }
}

export default InputItem;
