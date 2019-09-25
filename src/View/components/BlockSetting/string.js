export type BlockSettingDisplayType = {
  settingTitle: string,
  firstDropdownLabel: string,
  secondDropdownLabel: string
};

const SEGMENT = Object.freeze({
  settingTitle: 'Thêm đoạn thẳng',
  firstDropdownLabel: 'Chọn điểm',
  secondDropdownLabel: 'Chọn điểm'
});

const LINE = Object.freeze({
  settingTitle: 'Thêm đường thẳng',
  firstDropdownLabel: 'Chọn điểm',
  secondDropdownLabel: 'Chọn điểm'
});

const CIRCLE = Object.freeze({
  settingTitle: 'Thêm đường tròn',
  firstDropdownLabel: 'Chọn tâm',
  secondDropdownLabel: 'Chọn điểm'
});

export const DisplayData = Object.freeze({ SEGMENT, LINE, CIRCLE });
