// @flow

import * as React from 'react';
import Toggle from 'react-bootstrap-toggle';
import { DropdownButton, Dropdown, Button } from 'react-bootstrap';
import autobind from 'autobind-decorator';
import { Icon } from '../index';
import type { DrawingSegmentType } from '../../../utils/types';
import './SegmentSetting.scss';

type PropsType = {
  value?: DrawingSegmentType,
  data: Array<string>,
  onDone: void,
  onDelete: void,
  onVisibleChange: void
};

type StateType = {
  start: string,
  end: string,
  visible: boolean,
  isEditMode: boolean,
  isCreateMode: boolean
};

class SegmentSetting extends React.Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    const start = props.value ? props.value.name[0] : '';
    const end = props.value ? props.value.name[1] : '';
    this.state = {
      start,
      end,
      visible: true,
      isEditMode: !props.value,
      isCreateMode: !props.value
    };
  }

  @autobind
  onDone() {
    const { start, end } = this.state;
    const { onDone } = this.props;

    if (onDone) {
      onDone({ name: [start, end].sort().join(''), visible: true });
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
    const { onVisibleChange, value } = this.props;
    if (onVisibleChange) {
      onVisibleChange({ name: value.name, visible: !value.visible });
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
  onChangeContentState() {
    const { isEditMode, start, end } = this.state;
    if (!start || !end) {
      return;
    }
    this.setState({ isEditMode: !isEditMode });
  }
  @autobind
  renderDropdown(value: string, data: Array<string>, onSelect: void): React.Node {
    return (
      <DropdownButton title={value || 'Chọn điểm'} id={`segment-dropdown`} onSelect={onSelect}>
        {data.map((item: string, index: number): React.Node => (
          <Dropdown.Item key={`Drop-item-${index}`} eventKey={`${index}`}>
            {item}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    );
  }

  @autobind
  renderEditContent(): React.Node {
    const { data } = this.props;
    const { start, end, isCreateMode } = this.state;
    return (
      <div className="content-edit">
        <div className="drop-down-container">
          <div>{this.renderDropdown(start, data, this.onStartPointSelect)}</div>
          <div className="right-drop-down">
            {this.renderDropdown(end, data.filter((item) => item !== this.state.start), this.onEndPointSelect)}
          </div>
        </div>
        <div className="button-container">
          <Button variant="outline-danger" onClick={isCreateMode ? this.onDelete : this.onChangeContentState}>
            HỦY
          </Button>
          <div style={{ width: 5 }}></div>
          <Button variant={`${isCreateMode ? 'link' : 'success'}`} disabled={!(start && end)} onClick={this.onDone}>
            {isCreateMode ? 'THÊM' : 'CẬP NHẬT'}
          </Button>
        </div>
      </div>
    );
  }

  @autobind
  renderShowContent(): React.Node {
    const {
      value: { name, visible }
    } = this.props;
    return (
      <div className="content-show">
        <div className="content">
          <span>
            <p>{name}</p>
          </span>
          <Toggle
            onstyle="success"
            offstyle="danger"
            handleClassName="toggle-handler"
            onClick={this.onVisibleChange}
            off="HIỆN"
            on="ẨN"
            width={40}
            active={visible}
          />
          <div onClick={this.onChangeContentState}>
            <Icon name={'icEdit'} color={'#757575'} width={15} height={15} />
          </div>
          <div onClick={this.onDelete}>
            <Icon name={'icRemove'} color={'#757575'} width={15} height={15} />
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
    const { isEditMode, isCreateMode } = this.state;

    return (
      <div className="segment-setting">
        <div className="container">
          {isEditMode && (
            <div className="title">
              <p>{`${isCreateMode ? 'Thêm' : 'Cập nhật'} đoạn thẳng :`}</p>
            </div>
          )}
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default SegmentSetting;
