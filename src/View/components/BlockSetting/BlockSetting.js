//@flow

import BaseBlockSetting from './BaseBlockSetting/BaseBlockSetting';
import type { PropsType } from './BaseBlockSetting/BaseBlockSetting';
import React from 'react';
import { DisplayData } from './string';

const BlockSetting = (props: PropsType) => {
  const type = props.value.type || 'SEGMENT';
  return <BaseBlockSetting {...props} displayData={DisplayData[type]} />;
};

export { BlockSetting };
