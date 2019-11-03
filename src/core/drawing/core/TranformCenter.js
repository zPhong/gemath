import { Operation } from '../../math/MathOperation';

export function getTransformData({data, width, height}) {
    if (data) {
        const arrX = [];
        const arrY = [];

        if (Array.isArray(data.points)) {
            data.points.forEach((point) => {
                arrX.push(point.coordinate.x);
                arrY.push(point.coordinate.y);
            });

            const circles = data.circles;
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
            }
            else {
                ratio = Operation.Round(height / disparityY) * (1 - ODD);
            }

            const transitionX = width / 2 - (disparityX * ratio) / 2;
            const transitionY = height / 2 - (disparityY * ratio) / 2;

            const points = [];
            data.points.forEach((point) => {
                points.push({
                    id: point.id,
                    coordinate: {
                        x: (point.coordinate.x - minX) * ratio + transitionX,
                        y: (point.coordinate.y - minY) * ratio + transitionY,
                    },
                });
            });

            return {...data, points};
        }
    }
    else {
        return data;
    }
}