import React from 'react';
import './css/MainView.scss';
import { observer } from 'mobx-react';
import autobind from 'autobind-decorator';

import DataViewModel from '../ViewModel/DataViewModel';
import { InputConverter } from '../ViewModel/InputConverter';

import { DrawingPanel } from './components/DrawingPanel';
import { calculateDistanceTwoPoints, calculateVector, isVectorSameDirection } from '../core/math/Math2D';
import type { DrawingSegmentType, SegmentDataType } from '../utils/types';
import GConst from '../core/config/values';
import { LineStyle } from '../core/drawing/base/DrawingData';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
@observer
// @withRouter
class IFrameView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusIndex: 0,
      drawingData: [],
      points: [],
      segments: []
    };
    let param = queryString.parse(window.location.search);
  }

  componentDidMount() {
    let param = queryString.parse(window.location.search);

    DataViewModel.relationsInput = InputConverter(param.input);
    this.onClickDrawing();
  }

  // componentWillMount() {
  //   const { points, segments } = this.state;
  //   this.setState({
  //     drawingData: this.trimDrawingData({ points, segments }).map((segment: string): DrawingSegmentType => ({
  //       name: segment,
  //       visible: true,
  //       lineType: LineStyle.Medium
  //     }))
  //   });
  // }

  @autobind
  trimDrawingData(data) {
    const { points, segments } = data;

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
      if (segmentsData[point].length > 0) {
        const segments = this.uniqueSegmentData(segmentsData[point], removeSegments);
        result = result.concat(segments);
      }
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
  onClickDrawing() {
    DataViewModel.clear();

    const data = DataViewModel.analyzeInput();
    if (data.points.length === 0 && data.segments.length === 0) {
      DataViewModel.resetInputsStatus();
      return;
    }

    this.setState({
      points: data.points,
      segments: data.segments,
      drawingData: this.trimDrawingData(data).map((segment: string): DrawingSegmentType => ({
        name: segment,
        visible: true,
        lineType: LineStyle.Medium
      }))
    });
  }

  render() {
    const { points, drawingData } = this.state;
    return (
      <div className={'container-fluid'}>
        <div className={'app-header'}>
          <div className={'app-name'}>
            <p>Gemath</p>
          </div>
        </div>
        <div className="app-body">
          <div className={'app-drawing-panel'}>
            <DrawingPanel drawingData={{ points, segments: drawingData, circles: DataViewModel.circlesData }} />
          </div>
        </div>
      </div>
    );
  }
}

export default IFrameView;
