export const LineStyle = {
    Dashed: 0,
    Light: 1,
    Medium: 2,
    Bold: 3,
};

const NOT_FOUND = 'NOT FOUND';

function createDrawingData() {

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

    return Object.freeze({
        addPoint,
        addSegment,
        addLine,
        addCircle,

        getPoint,
        getSegment,
        getLine,
        getCircle,
    });

    function initialize() {
        __drawingMap__.set('segments', new Map());
        __drawingMap__.set('lines', new Map());
        __drawingMap__.set('circles', new Map());
    }

    function addPoint({name, x, y}) {
        if (name) {
            __pointsMap__.set(name, {
                x,
                y,
            });
        }
    }

    function addSegment({name, lineStyle, isVisible}) {
        if (name) {
            const startPoint = name[0];
            const endPoint = name[1];

            __drawingMap__
              .get('segments')
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

    function addLine({name, lineStyle, isVisible}) {
        if (name) {
            const startPoint = name[0];
            const endPoint = name[1];

            __drawingMap__
              .get('lines')
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
              .get('circles')
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
        return __pointsMap__.has(pointName) ?
          __pointsMap__.get(pointName) :
          {
              x: -Infinity,
              y: -Infinity,
          };
    }

    function getSegment(segmentName) {
        return __drawingMap__.get('segments').has(segmentName) ?
          __drawingMap__.get('segments').get(segmentName) :
          NOT_FOUND;
    }

    function getLine(lineName) {
        return __drawingMap__.get('lines').has(lineName) ?
          __drawingMap__.get('lines').get(lineName) :
          NOT_FOUND;
    }

    function getCircle(circleName) {
        return __drawingMap__.get('circles').has(circleName) ?
          __drawingMap__.get('circles').get(circleName) :
          NOT_FOUND;
    }
}