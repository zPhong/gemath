import * as React from 'react';
import type { DrawingDataType } from '../../../utils/types';
import './DrawingPanel.scss';
import createDrawingData from '../../../core/drawing/base/DrawingData';
import { getTransformData } from '../../../core/drawing/core/TranformCenter';
import { clearGeometry, renderSvg } from '../../../core/drawing/core/Render';

type PropsType = {
  drawingData: DrawingDataType
};

class DrawingPanel extends React.Component<PropsType> {
  componentDidMount() {
    this.renderGeometry(this.props.drawingData);
  }

  componentDidUpdate() {
    this.renderGeometry(this.props.drawingData);
  }

    renderGeometry(drawingData: DrawingDataType) {
        const svg = document.getElementById('geometry');
        const viewBox = svg.viewBox.baseVal;
        const width = viewBox.width;
        const height = viewBox.height;

    clearGeometry(svg);

    const transformData = getTransformData({
      data: drawingData,
      width,
      height
    });

        const data = createDrawingData({data: transformData});
        // function DataLogger(props, transformed) {
        //     this.dataProps = `${props.x} : ${props.y}`;
        //     this.dataTransformed = `${transformed.x} : ${transformed.y}`;
        // }
        //
        // let logger = {};
        // for(let pointsKey in this.props.drawingData.points) {
        //     const pointName = this.props.drawingData.points[pointsKey].id;
        //     if(pointName) {
        //         logger[pointName] = new DataLogger(this.props.drawingData.points[pointsKey].coordinate, transformData.points[pointsKey].coordinate)
        //     }
        // }
        // console.table(logger)
        // console.log(width, height)

        renderSvg({
            scene: svg,
            data,
        });
    }

  render(): React.Node {
    return (
      <div className="geometry-container">
        <svg id="geometry" className="geometry-scene" viewBox="0 0 800 800" />
      </div>
    );
  }
}

export default DrawingPanel;
