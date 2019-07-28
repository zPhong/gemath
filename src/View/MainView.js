import React from 'react';
import './css/MainView.scss';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';

import DataViewModel from '../ViewModel/DataViewModel';

import { InputItem, SegmentSetting, Icon } from './components';
import { DrawingPanel } from './components/DrawingPanel';
import { isVectorSameDirection, calculateVector, calculateDistanceTwoPoints } from '../core/math/Math2D';
import type { SegmentDataType, DrawingSegmentType } from '../utils/types';

@observer
class MainView extends React.Component {
  constructor(props) {
    super(props);
    this.inputRefs = [];
    this.state = {
      focusIndex: 0,
      drawingData: {
        points: [
          { id: 'A', coordinate: { x: 0, y: 0, z: 0 } },
          { id: 'B', coordinate: { y: 5, x: -7 } },
          { id: 'C', coordinate: { x: -9, y: 4.0901353661613005 } },
          { id: 'H', coordinate: { x: -3.0849364905389067, y: 6.781088913245535 } },
          { id: 'D', coordinate: { x: -5.250000000000003, y: 3.7500000000000018 } },
          { id: 'E', coordinate: { x: -8, y: 9.794855240493977 } }
        ],
        segments: [
          'AB',
          'BC',
          'AC',
          'AH',
          'DH',
          'DE',
          'HB',
          'HA',
          'HA',
          'HD',
          'DA',
          'DD',
          'DD',
          'DA',
          'ED',
          'EA',
          'HB',
          'HA',
          'HA',
          'HD',
          'DA',
          'DD',
          'DD',
          'DA',
          'ED',
          'EA',
          'HB',
          'HA',
          'HA',
          'HD',
          'DA',
          'DD',
          'DD',
          'DA',
          'ED',
          'EA'
        ]
      }
    };
    this.scrollView = React.createRef();
  }

  componentWillMount() {
    this.setState((prevState) => ({
      drawingData: {
        ...prevState.drawingData,
        segments: this.trimDrawingData().map((segment: string): DrawingSegmentType => ({
          name: segment,
          visible: true
        }))
      }
    }));
  }

  @autobind
  scrollToBottom() {
    if (this.scrollView.current) {
      setTimeout(() => {
        this.scrollView.current.firstChild.scrollIntoView(false);
      }, 250);
    }
  }

  @autobind
  trimDrawingData() {
    const {
      drawingData: { points, segments }
    } = this.state;

    //change to DataViewModel.getNodeInPointsMapById.coordinate when refactor done
    const pointData = {};
    points.forEach((point) => {
      pointData[point.id] = point.coordinate;
    });

    const segmentsData = {};
    let result = [];
    points.forEach((point) => {
      segmentsData[point.id] = segments
        .map((segment: string): string =>
          segment
            .split('')
            .sort()
            .join('')
        )
        .filter((segment: string): boolean => segment.includes(point.id))
        .map((segment: string): SegmentDataType => {
          const firstPoint = pointData[segment[0]];
          const secondPoint = pointData[segment[1]];
          return {
            name: segment,
            vector: calculateVector(firstPoint, secondPoint),
            length: calculateDistanceTwoPoints(firstPoint, secondPoint)
          };
        });
    });

    const removeSegments = [];

    Object.keys(segmentsData).forEach((point) => {
      const segments = this.uniqueSegmentData(segmentsData[point], removeSegments);
      result = result.concat(segments);
    });

    result = [...new Set(result)].filter((segment: string): boolean => segment[0] !== segment[1]);

    return result;
  }

  uniqueSegmentData(data: Array<SegmentDataType>, removeSegments: Array<string>): Array<string> {
    let result = [data[0]];
    for (let i = 1; i < data.length; i++) {
      const segmentData = data[i];
      const length = result.length;
      let replaceIndex = -1;
      for (let j = 0; j < length; j++) {
        if (isVectorSameDirection(segmentData.vector, result[j].vector)) {
          if (segmentData.length >= result[j].length) {
            replaceIndex = j;
          } else {
            removeSegments.push(segmentData.name);
          }
        }
      }
      if (replaceIndex >= 0) {
        result[replaceIndex] = segmentData;
      } else {
        if (!removeSegments.includes(segmentData.name)) {
          result.push(segmentData);
        }
      }
    }
    return result.map((segmentData: SegmentDataType): string => segmentData.name);
  }

  @autobind
  onValueChange(value: string, index: number) {
    DataViewModel.RelationsInput[index].value = value;
  }

  @autobind
  onSubmit(index: number) {
    if (index === DataViewModel.RelationsInput.length - 1 && DataViewModel.RelationsInput[index].value.length > 2) {
      DataViewModel.addNewInput();
    }

    this.setState({ focusIndex: index + 1 });
  }

  @autobind
  onBackspace(index: number) {
    const value = DataViewModel.RelationsInput[index].value;
    if (index === DataViewModel.RelationsInput.length - 1 && index > 0 && value.length === 0) {
      DataViewModel.removeInput();
      this.inputRefs.pop();
      this.setState({ focusIndex: index - 1 });
    }
  }

  @autobind
  onClickDrawing() {
    const data = DataViewModel.analyzeInput();
    this.setState({ drawingData: data }, () => {
      this.setState((prevState) => ({
        drawingData: {
          ...prevState.drawingData,
          segments: this.trimDrawingData().map((segment: string): DrawingSegmentType => ({
            name: segment,
            visible: true
          }))
        }
      }));
    });

    DataViewModel.getData.clear();
  }

  componentDidUpdate() {
    const { focusIndex } = this.state;
    if (this.inputRefs[focusIndex]) {
      this.inputRefs[focusIndex].focus();
    }
  }

  @autobind
  renderRelationInput(): React.Node {
    return DataViewModel.RelationsInput.map((model, index) => (
      <InputItem
        key={`input-${index}`}
        ref={(ref) => {
          this.inputRefs[index] = ref;
        }}
        onValueChange={(value: string) => {
          this.onValueChange(value, index);
        }}
        onSubmit={() => {
          this.onSubmit(index);
        }}
        onBackspace={() => {
          this.onBackspace(index);
        }}
        value={model.value}
        status={model.status}
      />
    ));
  }

  @autobind
  onDoneSegmentSetting(data: DrawingSegmentType, index: number) {
    const {
      drawingData: { segments }
    } = this.state;

    if (segments.map((segment: SegmentDataType): string => segment.name).includes(data.name)) {
      this.onDeleteSegmentSetting(index);
      return;
    }

    segments[index] = data;

    segments.this.setState((prevState) => ({
      drawingData: {
        ...prevState.drawingData,
        segments
      }
    }));
  }

  @autobind
  onChangeSegmentSetting(data: DrawingSegmentType, index: number) {
    const {
      drawingData: { segments }
    } = this.state;

    const newSegments = [...segments];
    newSegments[index] = data;

    this.setState((prevState) => ({
      drawingData: {
        ...prevState.drawingData,
        segments: newSegments
      }
    }));
  }

  @autobind
  onDeleteSegmentSetting(index: number) {
    const {
      drawingData: { segments }
    } = this.state;

    segments.splice(index, 1);
    this.setState((prevState) => ({
      drawingData: {
        ...prevState.drawingData,
        segments
      }
    }));
  }

  @autobind
  addNewSegmentSetting() {
    this.scrollToBottom();
    this.setState((prevState) => ({
      drawingData: {
        ...prevState.drawingData,
        segments: prevState.drawingData.segments.concat([undefined])
      }
    }));
  }

  @autobind
  renderSegmentSettings(): React.Node {
    const {
      drawingData: { segments }
    } = this.state;
    const points = this.state.drawingData.points.map((point: NodeType): number => point.id);

    return segments.map((segment: DrawingSegmentType, index: number): React.Node => {
      return (
        <SegmentSetting
          key={`segment-setting-${index}`}
          data={points}
          value={segment}
          onDone={(value) => {
            this.onDoneSegmentSetting(value, index);
          }}
          onVisibleChange={(value) => {
            this.onChangeSegmentSetting(value, index);
          }}
          onDelete={() => {
            this.onDeleteSegmentSetting(index);
          }}
        />
      );
    });
  }

  render() {
    return (
      <div className={'container-fluid'}>
        <div className={'app-header'}>
          <div className={'app-name'}>
            <p>Gemath</p>
          </div>

          <div className={'app-description'}>
            <p>app description</p>
          </div>
        </div>

        <div className="app-body">
          <div className="app-controller">
            <div className="accordion" id="accordionExample">
              <div className="card">
                <div
                  className="card-header left-panel-tab"
                  id="headingOne"
                  data-toggle="collapse"
                  data-target="#viewOne"
                  aria-expanded="true"
                  aria-controls="collapseOne">
                  <p>1. Nhập đề</p>
                  <OverlayTrigger
                    key="right"
                    container={this}
                    placement="right"
                    overlay={
                      <Tooltip id={`tooltip-right`} className="help-tooltip">
                        <div style={{ backgroundColor: 'white', flex: 1 }}>
                          <span>
                            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad
                            squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa
                            nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid
                            single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft
                            beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice
                            lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you
                            probably haven't heard of them accusamus labore sustainable VHS.
                          </span>
                        </div>
                      </Tooltip>
                    }>
                    <Button className="bg-transparent icon-container">
                      <Icon name="icInformation" width={25} height={25} />
                    </Button>
                  </OverlayTrigger>
                </div>
                <div
                  id="viewOne"
                  className="collapse show"
                  aria-labelledby="headingOne"
                  data-parent="#accordionExample">
                  <div className="card-body">
                    <div>
                      {this.renderRelationInput()}
                      <Button type="button" className="btn btn-success w-100" onClick={this.onClickDrawing}>
                        Vẽ hình
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div
                  className="card-header left-panel-tab"
                  id="headingTwp"
                  data-toggle="collapse"
                  data-target="#viewTwo"
                  aria-expanded="true"
                  aria-controls="collapseTwp">
                  <p>2. Chỉnh sửa hình</p>
                  <OverlayTrigger
                    key="right"
                    container={this}
                    placement="right"
                    overlay={
                      <Tooltip id={`tooltip-right`} className="help-tooltip">
                        <div style={{ backgroundColor: 'white', flex: 1 }}>
                          <span>
                            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad
                            squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa
                            nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid
                            single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft
                            beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice
                            lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you
                            probably haven't heard of them accusamus labore sustainable VHS.
                          </span>
                        </div>
                      </Tooltip>
                    }>
                    <Button className="bg-transparent icon-container">
                      <Icon name="icInformation" width={25} height={25} />
                    </Button>
                  </OverlayTrigger>
                </div>
                <div id="viewTwo" className="collapse " aria-labelledby="headingOne" data-parent="#accordionExample">
                  <div className="card-body" ref={this.scrollView}>
                    <div>
                      {this.renderSegmentSettings()}
                      <div className={'add-row-container'} onClick={this.addNewSegmentSetting}>
                        <Icon name={'icAdd'} width={35} height={35} color={'#757575'} />
                        <p>Thêm đoạn thẳng</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={'app-drawing-panel'}>
            <DrawingPanel drawingData={this.state.drawingData} />
          </div>
        </div>

        <div className={'app-footer'}>
          <p>abc</p>
        </div>
      </div>
    );
  }
}

export default MainView;
