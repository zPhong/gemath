import * as React from 'react';
import { Scene } from '../../../vendor/euclid';
import { renderGeometry, renderPoints } from '../../../vendor/euclid/render';
import type { DrawingDataType } from '../../../utils/types';
import './DrawingPanel.scss';
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

    while (svg.firstChild) {
      svg.firstChild.remove();
    }
    const pointElements = document.getElementById('points');
    while (pointElements.firstChild) {
      pointElements.firstChild.remove();
    }

    const { points, segments, circles } = drawingData;
    const viewBox = svg.viewBox.baseVal;
    const width = viewBox.width;
    const height = viewBox.height;

    const scene = new Scene({
      left: viewBox.x,
      top: viewBox.y,
      right: viewBox.x + width,
      bottom: viewBox.y + height
    });

    const arrX = [];
    const arrY = [];
    points.forEach((point) => {
      arrX.push(point.coordinate.x);
      arrY.push(point.coordinate.y);
    });

    const disparityX = Math.max(...arrX) - Math.min(...arrX);
    const disparityY = Math.max(...arrY) - Math.min(...arrY);
    let ratio = 0;
    const ODD = 15;
    if (disparityX / disparityY >= 1) {
      // scale theo width
      // giá trị ước lượng (ODD): nhằm tránh điểm render ngay cạnh của viewBox sẽ làm mất tên điểm
      ratio = Math.floor(width / disparityX) - ODD;
    } else {
      ratio = Math.floor(height / disparityY) - ODD;
    }

    const anchorX = Math.min(...arrX) + disparityX / 2;
    const anchorY = Math.min(...arrY) + disparityY / 2;
    points.forEach((point) => {
      scene.point(
        point.id,
        point.coordinate.x * ratio + width / 2 - ratio * anchorX,
        point.coordinate.y * ratio + height / 2 - ratio * anchorY
      );
    });

    segments.forEach((segment) => {
      if (segment && segment.visible) {
        scene.segment(segment.name, segment.name[0], segment.name[1]);
      }
    });

    if (circles) {
      Object.keys(circles).forEach((point) => {
        console.log(point, circles[point]);
        scene.point(
          point,
          circles[point].center.x * ratio + width / 2 - ratio * anchorX,
          circles[point].center.y * ratio + height / 2 - ratio * anchorY
        );
        scene.circle(`circle-${point}`, point, circles[point].radius * ratio);
      });
    }

    console.log(scene);

    scene.update();
    renderGeometry(scene, svg);
    renderGeometry(scene, svg);
    renderPoints(scene, pointElements);
  }

  render(): React.Node {
    return (
      <div className="geometry-container">
        <svg id="geometry" className="geometry-scene" viewBox="0 0 800 800" />
        <svg id="points" className="geometry-scene" viewBox="0 0 800 800" />
      </div>
    );
  }
}

export default DrawingPanel;
