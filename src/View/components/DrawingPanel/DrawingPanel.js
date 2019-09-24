import * as React from 'react';
import { Scene } from '../../../vendor/euclid';
import { renderGeometry, renderPoints } from '../../../vendor/euclid/render';
import type { DrawingDataType } from '../../../utils/types';
import './DrawingPanel.scss';
import { Operation } from '../../../core/math/MathOperation';
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

    if (circles) {
      Object.keys(circles).forEach((point) => {
        const center = circles[point].center;
        const radius = circles[point].radius;
        arrX.push(center.x - radius, center.x + radius);
        arrX.push(center.y - radius, center.y + radius);
      });
    }
    const minX = Math.min(...arrX);
    const minY = Math.min(...arrY);
    const disparityX = Math.max(...arrX) - minX;
    const disparityY = Math.max(...arrY) - minY;
    const ODD = 0.15;
    let ratio = 1;
    if (disparityX / disparityY >= 1) {
      // scale theo width
      // giá trị ước lượng (ODD): nhằm tránh điểm render ngay cạnh của viewBox sẽ làm mất tên điểm
      ratio = Operation.Round(width / disparityX) * (1 - ODD);
    } else {
      ratio = Operation.Round(height / disparityY) * (1 - ODD);
    }

    const transitionX = width / 2 - (disparityX * ratio) / 2;
    const transitionY = height / 2 - (disparityY * ratio) / 2;
    points.forEach((point) => {
      scene.point(
        point.id,
        (point.coordinate.x - minX) * ratio + transitionX,
        (point.coordinate.y - minY) * ratio + transitionY
      );
    });

    segments.forEach((segment) => {
      if (segment && segment.visible) {
        scene.segment(segment.name, segment.name[0], segment.name[1]);
      }
    });

    if (circles) {
      Object.keys(circles).forEach((point) => {
        const circlePoint = {
          x: circles[point].radius + circles[point].center.x,
          y: circles[point].radius + circles[point].center.y
        };
        scene.point(
          point,
          (circles[point].center.x - minX) * ratio + transitionX,
          (circles[point].center.y - minY) * ratio + transitionY
        );

        const scaledCirclePoint = {
          x: (circlePoint.x - minX) * ratio + transitionX,
          y: (circlePoint.y - minY) * ratio + transitionY
        };
        console.log(circles[point].radius, ratio);
        scene.circle(`circle-${point}`, point, circles[point].radius * ratio);
      });
    }

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
