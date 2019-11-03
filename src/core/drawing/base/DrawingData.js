export const LineStyle = {
    Dashed: 0,
    Light: 1,
    Medium: 2,
    Bold: 3,
};

const SEGMENTS = 'segments';
const LINES = 'lines';
const CIRCLES = 'circles';
const NOT_FOUND = 'NOT FOUND';

export default function createDrawingData({data}) {

    // Stores a pair of a point name-coordinate
    const __pointsMap__ = new Map();

    /*  Stores 3 of instances drawing type:
     *     + Segments type:
     *       ∙ name -> { startPoint, endPoint, lineStyle, isVisible }
     *     + Lines type:
     *       ∙ name -> { lineStyle, isVisible }
     *     + Circles type:
     *       ∙ name -> { centerPoint, radius, lineStyle, isVisible }
     */
    const __drawingMap__ = new Map();

    initialize();
    initData(data);

    return Object.freeze({
        addPoint,
        addPoints,
        addSegment,
        addSegments,
        addLine,
        addCircle,

        getPoint,
        getPoints,
        getSegment,
        getSegments,
        getLine,
        getLines,
        getCircle,
        getCircles,
    });

    function initialize() {
        __drawingMap__.set(SEGMENTS, new Map());
        __drawingMap__.set(LINES, new Map());
        __drawingMap__.set(CIRCLES, new Map());
    }

    function initData(data) {
        if (data.points) {
            addPoints(data.points);
        }
        if (data.segments) {
            addSegments(data.segments);
        }
        if (data.lines) {
            // addLines(data.lines);
        }
        if (data.circles) {
            //addCircles(data.circles);
        }
    }

    function addPoint({name, x, y}) {
        if (name) {
            __pointsMap__.set(name, {
                x,
                y,
            });
        }
    }

    function addPoints(points) {
        if (Array.isArray(points)) {
            points.forEach(point => {
                addPoint({
                    name: point.id,
                    x: point.coordinate.x,
                    y: point.coordinate.y,
                });
            });
        }
    }

    function addSegment({name, lineStyle, isVisible}) {
        if (name) {
            const startPoint = name[0];
            const endPoint = name[1];

            __drawingMap__
                .get(SEGMENTS)
                .set(
                    name,
                    {
                        startPoint: startPoint,
                        endPoint: endPoint,
                        lineStyle: lineStyle ?
                            lineStyle :
                            LineStyle.Light,
                        isVisible: isVisible ?
                            isVisible :
                            true,
                    });
        }
    }

    function addSegments(segments) {
        if (Array.isArray(segments)) {
            segments.forEach((segment) => {
                addSegment({
                    name: segment.name,
                    lineStyle: segment.lineStyle,
                    isVisible: segment.isVisible,
                });
            });
        }
    }

    function addLine({name, lineStyle, isVisible}) {
        if (name) {
            const startPoint = name[0];
            const endPoint = name[1];

            __drawingMap__
                .get(LINES)
                .set(
                    name,
                    {
                        startPoint: startPoint,
                        endPoint: endPoint,
                        lineStyle: lineStyle ?
                            lineStyle :
                            LineStyle.Light,
                        isVisible: isVisible ?
                            isVisible :
                            true,
                    });
        }
    }

    function addCircle({name, lineStyle, isVisible}) {
        if (name) {
            const centerPoint = name[0];

            __drawingMap__
                .get(CIRCLES)
                .set(
                    name,
                    {
                        centerPoint: centerPoint,
                        radius: '0',
                        lineStyle: lineStyle ?
                            lineStyle :
                            LineStyle.Light,
                        isVisible: isVisible ?
                            isVisible :
                            true,
                    });
        }
    }

    function getPoint(pointName) {
        const uppercasePointName = pointName.toUpperCase();
        return __pointsMap__.has(uppercasePointName) ?
            __pointsMap__.get(uppercasePointName) :
            {
                x: -Infinity,
                y: -Infinity,
            };
    }

    function getPoints() {
        let res = [];
        const keys = __pointsMap__.keys();
        for (let i = 0; i < __pointsMap__.size; i++) {
            const pointName = keys.next().value;
            const pointValues = __pointsMap__.get(pointName);
            const point = {
                name: pointName,
                coordinate: {
                    x: pointValues.x,
                    y: pointValues.y,
                },
            };
            res.push(point);
        }
        return res;
    }

    function getSegment(segmentName) {
        return __drawingMap__.get(SEGMENTS).has(segmentName) ?
            __drawingMap__.get(SEGMENTS).get(segmentName) :
            NOT_FOUND;
    }

    function getSegments() {
        let res = [];
        const segments = __drawingMap__.get(SEGMENTS);
        const segmentKeys = segments.keys();
        for (let i = 0; i < segments.size; i++) {
            const segmentName = segmentKeys.next().value;
            const segmentValue = getSegment(segmentName);
            const segment = {
                name: segmentName,
                startPoint: segmentValue.startPoint,
                endPoint: segmentValue.endPoint,
                lineStyle: segmentValue.lineStyle,
                isVisible: segmentValue.isVisible,
            };
            res.push(segment);
        }
        return res;
    }

    function getLine(lineName) {
        return __drawingMap__.get(LINES).has(lineName) ?
            __drawingMap__.get(LINES).get(lineName) :
            NOT_FOUND;
    }

    function getLines() {
        let res = [];
        const lines = __drawingMap__.get(LINES);
        const lineKeys = lines.keys();
        for (let i = 0; i < lines.size; i++) {
            const lineName = lineKeys.next().value;
            const lineValue = getSegment(lineName);
            const segment = {
                name: lineName,
                lineStyle: lineValue.lineStyle,
                isVisible: lineValue.isVisible,
            };
            res.push(segment);
        }
        return res;
    }

    function getCircle(circleName) {
        return __drawingMap__.get(CIRCLES).has(circleName) ?
            __drawingMap__.get(CIRCLES).get(circleName) :
            NOT_FOUND;
    }

    function getCircles() {
        let res = [];
        const circles = __drawingMap__.get(CIRCLES);
        const circletKeys = circles.keys();
        for (let i = 0; i < circles.size; i++) {
            const circleName = circletKeys.next().value;
            const circleValue = getSegment(circleName);
            const segment = {
                name: circleName,
                centerPoint: circleValue.centerPoint,
                radius: circleValue.radius,
                lineStyle: circleValue.lineStyle,
                isVisible: circleValue.isVisible,
            };
            res.push(segment);
        }
        return res;
    }
}