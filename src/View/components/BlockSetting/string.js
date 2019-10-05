export type BlockSettingDisplayType = {
  settingTitle: string,
  firstDropdownLabel: string,
  secondDropdownLabel: string,
  resultStatement: string
};

const SEGMENT = Object.freeze({
  settingTitle: 'đoạn thẳng',
  firstDropdownLabel: 'Chọn điểm',
  secondDropdownLabel: 'Chọn điểm',
  resultStatement: 'Đoạn thẳng {start}{end}'
});

const LINE = Object.freeze({
  settingTitle: 'đường thẳng',
  firstDropdownLabel: 'Chọn điểm',
  secondDropdownLabel: 'Chọn điểm',
  resultStatement: 'Đường thẳng {start}{end}'
});

const CIRCLE = Object.freeze({
  settingTitle: 'đường tròn',
  firstDropdownLabel: 'Chọn tâm',
  secondDropdownLabel: 'Chọn điểm',
  resultStatement: '({start},{start}{end})'
});

export const DisplayData = Object.freeze({ SEGMENT, LINE, CIRCLE });
