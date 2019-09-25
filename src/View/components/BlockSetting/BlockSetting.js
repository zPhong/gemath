//@flow

import BaseBlockSetting from './BaseBlockSetting/BaseBlockSetting';
import type { PropsType } from './BaseBlockSetting/BaseBlockSetting';
import React from 'react';
import { DisplayData } from './string';

type BlockType = {
  type: 'SEGMENT' | 'LINE' | 'CIRCLE'
};
const BlockSetting = (type: BlockType = 'SEGMENT', props: PropsType) => (
  <BaseBlockSetting {...props} displayData={DisplayData[type]} />
);

export { BlockSetting };
