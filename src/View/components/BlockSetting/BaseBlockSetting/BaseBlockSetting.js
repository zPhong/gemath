// @flow

import * as React from 'react';
import Toggle from 'react-bootstrap-toggle';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import autobind from 'autobind-decorator';
import { Icon } from '../../index';
import type { DrawingSegmentType } from '../../../../utils/types';
import type { BlockSettingDisplayType } from '../string';
import './BaseBlockSetting.scss';

export type BlockType = 'SEGMENT' | 'LINE' | 'CIRCLE';

export type PropsType = {
  type: BlockType,
  value?: DrawingSegmentType,
  data: Array<string>,
  displayData: BlockSettingDisplayType,
  onDone: void,
  onDelete: void,
  onVisibleChange: void
};

type StateType = {
  start: string,
  end: string,
  lineType: string,
  visible: boolean,
  isEditMode: boolean,
  isCreateMode: boolean,
  isMouseHoverEdition: boolean,
  isMouseHoverDeletion: boolean
};

const lineTypesMap = {
  'Nét đứt': 'Dashed',
  'Nét mỏng': 'Light',
  'B.thường': 'Medium',
  'Nét dày': 'Bold'
};

const lineTypes = ['Nét đứt', 'Nét mỏng', 'B.thường', 'Nét dày'];

class BaseBlockSetting extends React.Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    const start = props.value.name ? props.value.name[0] : '';
    const end = props.value.name ? props.value.name[1] : '';
    this.state = {
      start,
      end,
      visible: true,
      isEditMode: !props.value.name,
      isCreateMode: !props.value.name,
      isMouseHoverEdition: false,
      isMouseHoverDeletion: false,
      lineType: (props.value && props.value.lineType) || 'Medium'
    };
    console.log((props.value && props.value.lineType) || 'Medium');
  }

  componentWillMount() {
    this.setStatement();
  }

  @autobind
  setStatement(): string {
    const { start, end } = this.state;
    const { displayData } = this.props;

    const statement = displayData.resultStatement.split(' ').reduce((result: string, item: string) => {
      let editedItem = item;
      const obj = { start, end };
      Object.keys(obj).forEach((key: string) => {
        editedItem = editedItem.replace(new RegExp(`{${key}}`, 'gi'), obj[key]);
      });
      result += ' ';
      result += editedItem;
      return result;
    });

    this.setState({ statement });
  }

  @autobind
  onDone() {
    const { onDone, type } = this.props;
    const { start, end, lineType } = this.state;

    if (onDone) {
      onDone({ name: `${start}${end}`, lineType, type, visible: true });
    }
    this.setState({ isEditMode: false });
  }

  @autobind
  onDelete() {
    const { onDelete } = this.props;
    if (onDelete) {
      onDelete();
    }
  }

  @autobind
  onVisibleChange(visible: boolean) {
    const { onVisibleChange, value, type } = this.props;
    const { lineType } = this.state;
    if (onVisibleChange) {
      onVisibleChange({ name: value.name, type, lineType, visible: !value.visible });
    }
  }

  @autobind
  getIndexInData(dropdownIndex: string, filterValue: string): number {
    const { data } = this.props;
    const filterValueIndex = data.indexOf(filterValue);
    if (filterValueIndex < 0) {
      return dropdownIndex;
    }
    return filterValueIndex > dropdownIndex ? dropdownIndex : parseInt(dropdownIndex) + 1;
  }

  @autobind
  onStartPointSelect(index: string) {
    const { data } = this.props;
    const { start, end } = this.state;
    const newStartValue = data[index];
    if (newStartValue === end) {
      this.setState({ start: newStartValue, end: start });
    } else {
      this.setState({ start: newStartValue });
    }
  }

  @autobind
  onEndPointSelect(index: string) {
    const { data } = this.props;
    this.setState({ end: data[this.getIndexInData(index, this.state.start)] });
  }

  @autobind
  mouseHoverEdition() {
    this.setState({ isMouseHoverEdition: true });
  }

  @autobind
  mouseLeaveEdition() {
    this.setState({ isMouseHoverEdition: false });
  }

  @autobind
  mouseHoverDeletion() {
    this.setState({ isMouseHoverDeletion: true });
  }

  @autobind
  mouseLeaveDeletion() {
    this.setState({ isMouseHoverDeletion: false });
  }

  @autobind
  onChangeContentState() {
    const { isEditMode, start, end } = this.state;
    if (!start || !end) {
      return;
    }
    this.setState({ isEditMode: !isEditMode });
  }

  @autobind
  onSelectLineType(value: string) {
    console.log(lineTypesMap[lineTypes[value]]);
    this.setState({ lineType: lineTypesMap[lineTypes[value]] });
  }

  @autobind
  renderDropdown(id: string, value: string, data: Array<string>, onSelect: void): React.Node {
    return (
      <DropdownButton title={value || 'Chọn điểm'} id={`segment-dropdown`} onSelect={onSelect}>
        {data.map((item: string, index: number): React.Node => (
          <Dropdown.Item key={`Drop-item-${id}-${index}`} eventKey={`${index}`}>
            {item}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  }

  @autobind
  renderEditContent(): React.Node {
    const { data, displayData } = this.props;
    const { start, end, isCreateMode, lineType } = this.state;
    return (
      <div className="content-edit">
        <div className="drop-down-container">
          <div className={'col-6 p-0'}>
            {this.renderDropdown('1', start || displayData.firstDropdownLabel, data, this.onStartPointSelect)}
          </div>
          <div className="col-6 p-0 right-drop-down">
            {this.renderDropdown(
              '2',
              end || displayData.secondDropdownLabel,
              data.filter((item) => item !== this.state.start),
              this.onEndPointSelect
            )}
          </div>
        </div>

        <div className="button-container mt-1">
          <div className="line-type-container">
            <div className="d-flex align-items-center">
              <p className="m-0 p-0">Loại nét :</p>
            </div>
            {this.renderDropdown(
              'lineTye',
              Object.keys(lineTypesMap).filter((key: string): boolean => lineType === lineTypesMap[key])[0],
              lineTypes,
              this.onSelectLineType
            )}
          </div>

          <div className={'col-6 p-0 d-flex justify-content-between'}>
            <Button className={'btn-cancel'} onClick={isCreateMode ? this.onDelete : this.onChangeContentState}>
              HỦY
            </Button>
            <Button
              className={'btn-update'}
              variant={`${isCreateMode ? 'link' : 'success'}`}
              disabled={!(start && end)}
              onClick={this.onDone}>
              {isCreateMode ? 'THÊM' : 'CẬP NHẬT'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  @autobind
  renderShowContent(): React.Node {
    const {
      value: { visible }
    } = this.props;
    const { statement } = this.state;
    return (
      <div className="content-show">
        <div className="content">
          <div className={'segment-edit-name col-8'}>
            <p>{statement}</p>
          </div>

          <div className={'segment-edit-controller col-4'}>
            <Toggle
              onstyle="success"
              offstyle="danger"
              handleClassName="toggle-handler"
              onClick={this.onVisibleChange}
              off="HIỆN"
              on="ẨN"
              active={visible}
            />

            <div
              onClick={this.onChangeContentState}
              onMouseLeave={this.mouseLeaveEdition}
              onMouseOver={this.mouseHoverEdition}
              onMouseDown={this.mouseLeaveEdition}>
              {this.state.isMouseHoverEdition ? (
                <Icon name={'icEdit'} color={'#218838'} width={16} height={16} />
              ) : (
                <Icon name={'icEdit'} color={'#757575'} width={16} height={16} />
              )}
            </div>

            <div
              onClick={this.onDelete}
              onMouseOver={this.mouseHoverDeletion}
              onMouseLeave={this.mouseLeaveDeletion}
              onMouseDown={this.mouseLeaveDeletion}>
              {this.state.isMouseHoverDeletion ? (
                <Icon name={'icRemove'} color={'#dc3545'} width={16} height={16} />
              ) : (
                <Icon name={'icRemove'} color={'#757575'} width={16} height={16} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  @autobind
  renderContent(): React.Node {
    const { isEditMode } = this.state;
    if (isEditMode) {
      return this.renderEditContent();
    }

    return this.renderShowContent();
  }

  render(): React.Node {
    const { style, displayData } = this.props;
    const { isEditMode, isCreateMode } = this.state;

    return (
      <div className="segment-setting" style={{ ...style }}>
        <div className="container">
          {isEditMode && (
            <div className="title">
              <p>{`${isCreateMode ? 'Thêm' : 'Cập nhật'} ${displayData.settingTitle} :`}</p>
            </div>
          )}
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default BaseBlockSetting;
