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
    console.log(this.props.drawingData);

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

    const data = createDrawingData({ data: transformData });
    renderSvg({
      scene: svg,
      data
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
