// @flow

import * as React from 'react';
import { inputSuccess, inputError, inputNormal, icInformation, icRemove, icEdit, icAdd, icPlusBold } from './Svg';

type PropsType = {
  name: string,
  color: string,
  width: number,
  height: number
};

const iconList = {
  inputSuccess,
  inputError,
  inputNormal,
  icInformation,
  icRemove,
  icEdit,
  icAdd,
  icPlusBold
};

export default class Icon extends React.Component<PropsType> {
  render(): React.Node {
    const { name, width, height, color } = this.props;
    const icon = iconList[name];
    return (
      <svg width={width} height={height} viewBox={icon.viewBox}>
        {icon.svg({ color })}
      </svg>
    );
  }
}
