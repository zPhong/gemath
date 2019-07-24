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
  isEditMode: boolean
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
      isEditMode: !props.value
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
    const { isEditMode } = this.state;
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
    const { start, end } = this.state;
    return (
      <div className="content-edit">
        <div className="drop-down-container">
          <div>{this.renderDropdown(start, data, this.onStartPointSelect)}</div>
          <div className="right-drop-down">
            {this.renderDropdown(end, data.filter((item) => item !== this.state.start), this.onEndPointSelect)}
          </div>
        </div>
        <div className="button-container">
          <Button variant="success" disabled={!(start && end)}>
            Thêm
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
            onClick={this.onVisibleChange}
            on=" "
            off=" "
            width={40}
            height={20}
            active={visible}
          />
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
    const { isEditMode } = this.state;

    return (
      <div className="segment-setting">
        <div className="container" onDoubleClick={this.onChangeContentState}>
          {isEditMode && (
            <div className="title">
              <p>Thêm đoạn thẳng :</p>
            </div>
          )}
          {this.renderContent()}
          <div className="delete-btn-container">
            <div className="delete-icon-container">
              <Icon name="icClose" width={20} height={20} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SegmentSetting;
