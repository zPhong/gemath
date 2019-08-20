import * as d3 from 'd3';
import { Circle, Line, Point, Segment } from './model';

function klasses() {
  let init = Array.prototype.slice.call(arguments, 0);
  return (d) => init.concat(d.classes ? d.classes.values() : []).join(' ');
}

function renderGeometry(scene, svgElement) {
  let svg = d3.select(svgElement);

  /* circles */
  let circles = svg.selectAll('g.circle').data(scene.objects().filter((d) => d instanceof Circle));

  let circleGroup = circles
    .enter()
    .append('g')
    .attr('class', klasses('circle'));
  circleGroup.append('circle').attr('class', 'handle');
  circleGroup.append('circle').attr('class', 'visible');

  circles
    .attr('class', klasses('circle'))
    .selectAll('circle')
    .attr('cx', (d) => d.center.x)
    .attr('cy', (d) => d.center.y)
    .attr('r', (d) => d.radius);

  circles.exit().remove();

  /* lines */
  let lines = svg.selectAll('g.line').data(scene.objects().filter((d) => d instanceof Line));

  let lineGroup = lines
    .enter()
    .append('g')
    .attr('class', klasses('line'));
  lineGroup.filter((d) => d instanceof Segment).attr('class', klasses('line', 'segment'));
  lineGroup.append('line').attr('class', 'handle');
  lineGroup.append('line').attr('class', 'visible');

  // TODO: this is grossly inefficient
  function endpoint(index, coord) {
    return (d) => {
      let s = d instanceof Segment ? d : Segment.clip(scene.bounds, d);
      return s.p[index][coord];
    };
  }

  lines
    .attr('class', klasses('line'))
    .selectAll('line')
    .attr('x1', endpoint(0, 'x'))
    .attr('y1', endpoint(0, 'y'))
    .attr('x2', endpoint(1, 'x'))
    .attr('y2', endpoint(1, 'y'));

  lines.exit().remove();
}

function renderPoints(scene, svgElement) {
  let svg = d3.select(svgElement);

  /* points */
  let points = svg.selectAll('circle.point').data(scene.objects().filter((d) => d instanceof Point));

  points
    .enter()
    .append('circle')
    .attr('class', klasses('point'))
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => 5);

  points
    .enter()
    .append('text')
    .attr('class', klasses('point-name'))
    .attr('x', (d) => d.x + 10)
    .attr('y', (d) => d.y - 15)
    .attr('id', (d) => `point-${d.name}`);

  points.enter()._groups[0].forEach((node) => {
    const name = node.__data__.name;
    document.getElementById(`point-${name}`).appendChild(document.createTextNode(name));
  });

  points.exit().remove();
}

export { renderGeometry, renderPoints };
