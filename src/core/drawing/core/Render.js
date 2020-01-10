import * as d3 from 'd3';
import { LineStyle } from '../base/DrawingData';

export function renderSvg({scene, data}) {
    const sWidth = scene.clientWidth;
    const sHeight = scene.clientHeight;

    const svg = d3.select(`#${scene.id}`)
        .attr('viewBox', [
            0,
            0,
            sWidth,
            sHeight,
        ]);

    // ========== Segments ==========
    const l = svg.append('g')
        .attr('cursor', 'grab');

    function getCoordinate(name) {
        if (name) {
            return {
                x: data.getPoint(name).x,
                y: data.getPoint(name).y,
            };
        }
    }

    function slicePoints(segmentName) {
        const arr = Array.prototype.slice.call(segmentName, 0);
        if (arr && arr[0] && arr[1]) {
            return {
                startPoint: arr[0],
                endPoint: arr[1],
            };
        }
        else {
            return [];
        }
    }

    function getStyles(comp) {
        let style = '';
        switch (comp.lineStyle) {
            case LineStyle.Light:
                style = `stroke-width: ${LineStyle.Light}`;
                break;
            case LineStyle.Medium:
                style = `stroke-width: ${LineStyle.Medium}`;
                break;
            case LineStyle.Bold:
                style = `stroke-width: ${LineStyle.Bold}`;
                break;
            default:
                style = `stroke-width: ${LineStyle.Light}`;
        }

        if (comp.isVisible) {
            if (style !== '') {
                style += '; ';
            }
            style += 'visibility: visible';
        }
        else {
            if (style !== '') {
                style += '; ';
            }
            style += 'visibility: hidden';
        }

        return style;
    }

    const dSegments = data.getSegments();

    l.selectAll('line')
        .data(dSegments)
        .join('line')
        .attr('x1', (segment) => getCoordinate(slicePoints(segment.name).startPoint).x)
        .attr('y1', (segment) => getCoordinate(slicePoints(segment.name).startPoint).y)
        .attr('x2', (segment) => getCoordinate(slicePoints(segment.name).endPoint).x)
        .attr('y2', (segment) => getCoordinate(slicePoints(segment.name).endPoint).y)
        .attr('stroke-dasharray', segment => segment.lineStyle === 0 ?
            ('6,3') :
            'none')
        .attr('style', segment => getStyles(segment));


    // ========== Circles ==========
    const c = svg.append('g')
        .attr('cursor', 'grab');

    let dCircles = data.getCircles();
    c.selectAll('circle')
        .data(dCircles)
        .join('circle')
        .attr('cx', dCircles => dCircles.center.coordinate.x)
        .attr('cy', dCircles => dCircles.center.coordinate.y)
        .attr('r', dCircles => dCircles.radius)
        .attr('stroke-dasharray', segment => segment.lineStyle === 0 ?
            ('6,3') :
            'none')
        .attr('style', circle => getStyles(circle));


    // ========== Points ==========
    const p = svg.append('g')
        .attr('cursor', 'grab');

    let dPoints = data.getPoints();
    const radius = 4;
    const points = p.selectAll('circle').data(dPoints);

    points.enter()
        .append('circle')
        .attr('cx', p => p.coordinate.x)
        .attr('cy', p => p.coordinate.y)
        .attr('r', radius)
        .attr('fill', (circleObj, i) => d3.interpolateRainbow(i / dPoints.length));

    const fontSize = 22;

    function getPointNamePosition(pName) {
        /*
         * With biggest char:
         *  width's element excludes text = 0.67 font-size;
         *  height's element excludes text = 1.37 font-size;
         */

        const minH = data.getMinHorizontalPoint();
        const maxH = data.getMaxHorizontalPoint();
        const minV = data.getMinVerticalPoint();
        const maxV = data.getMaxVerticalPoint();

        if (pName === minH.name) {
            return {
                x: minH.coordinate.x - fontSize * 0.67 - 10,
                y: minH.coordinate.y + (fontSize * 1.37) / 3.8,
            };
        }
        else if (pName === maxH.name) {
            return {
                x: maxH.coordinate.x + 10,
                y: maxH.coordinate.y + (fontSize * 1.37) / 3.8,
            };
        }

        if (pName === minV.name) {
            return {
                x: minV.coordinate.x - (fontSize * 0.67) / 2,
                y: minV.coordinate.y - 10,
            };
        }
        else if (pName === maxV.name) {
            return {
                x: maxV.coordinate.x - (fontSize * 0.67) / 2,
                y: maxV.coordinate.y + fontSize * 1.37,
            };
        }

        return {
            x: data.getPoint(pName).x + fontSize / 2,
            y: data.getPoint(pName).y - fontSize / 2,
        };
    }

    points.enter()
        .append('text')
        .attr('x', p => getPointNamePosition(p.name).x)
        .attr('y', p => getPointNamePosition(p.name).y)
        .attr('id', p => `point-${p.name}`);

    if (points && points._enter && Array.isArray(points._enter[0])) {
        points._enter[0].forEach((node) => {
            let name = '';
            if (node && node.__data__ && node.__data__.name) {
                name = node.__data__.name;
            }

            const element = document.getElementById(`point-${name}`);
            if (element) {
                const textNode = document.createTextNode(name);
                element.appendChild(textNode);
                element.style.fontSize = `${fontSize}px`;
                element.style.fontFamily = 'appDescriptionFont';
                element.style.fill = 'black';
            }
        });
    }

    svg.call(d3.zoom()
        .extent([
            [
                0,
                0,
            ],
            [
                sWidth,
                sHeight,
            ],
        ])
        .scaleExtent([
            1,
            20,
        ])
        .on('zoom', zoomed));


    function zoomed() {
        p.attr('transform', d3.event['transform']);
        l.attr('transform', d3.event['transform']);
        c.attr('transform', d3.event['transform']);
    }

    return svg.node();
}

export function clearGeometry(scene) {
    while (scene.firstChild) {
        scene.firstChild.remove();
    }
}