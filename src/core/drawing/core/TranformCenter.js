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
                    arrY.push(center.y - radius, center.y + radius);
                });
            }
            const minX = Math.min(...arrX);
            const minY = Math.min(...arrY);
            const maxX = Math.max(...arrX);
            const maxY = Math.max(...arrY);
            const disparityX = maxX - minX;
            const disparityY = maxY - minY;

            const ODD = 100;
            const w = width - ODD,
                h = height - ODD;
            let ratio = 0;
            const rW = Math.floor(w / disparityX),
                rH = Math.floor(h / disparityY);
            let transitionX = 0,
                transitionY = 0;
            let followH = false;
            if (rW >= rH) {
                ratio = rH;
                followH = true;
            }
            else {
                ratio = rW;
            }

            let realCenter = 0, curCenter = 0;
            if (followH) {
                realCenter = width / 2;
                curCenter = ((maxX - minX) / 2) * ratio;
                transitionX = -(minX * ratio) + realCenter - curCenter;
                transitionY = -(minY * ratio) + Math.floor(ODD / 2);
            }
            else {
                realCenter = height / 2;
                curCenter = ((maxY - minY) / 2) * ratio;
                transitionX = -(minX * ratio) + Math.floor(ODD / 2);
                transitionY = -(minY * ratio) + realCenter - curCenter;
            }

            console.log({
                minX,
                minY,
                maxX,
                maxY,
                disparityX,
                disparityY,
                w,
                h,
                rW,
                rH,
                ratio,
                followH,
                realCenter,
                curCenter,
                transitionX,
                transitionY,
            });
            const points = [];
            data.points.forEach((point) => {
                points.push({
                    id: point.id,
                    coordinate: {
                        x: point.coordinate.x * ratio + transitionX,
                        y: point.coordinate.y * ratio + transitionY,
                    },
                });
            });

            if (circles) {
                const keys = Object.keys(circles);
                let i = 0;
                while (keys[i]) {
                    circles[keys[i]] = {
                        center: {
                            x: circles[keys[i]].center.x * ratio + transitionX,
                            y: circles[keys[i]].center.y * ratio + transitionY,
                        },
                        radius: circles[keys[i]].radius * ratio,
                        equation: circles[keys[i]].equation,
                    };
                    i++;
                }
            }

            return {
                ...data,
                points,
                circles,
            };
        }
    }
    else {
        return data;
    }
}