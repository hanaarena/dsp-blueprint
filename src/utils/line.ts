export function detectIntersection(l1: Line, l2: Line): Point | null {
  const det =
    (l1.x2 - l1.x1) * (l2.y2 - l2.y1) - (l2.x2 - l2.x1) * (l1.y2 - l1.y1);
  if (det === 0) {
    return null;
  }

  const lambda =
    ((l2.y2 - l2.y1) * (l2.x2 - l1.x1) + (l2.x1 - l2.x2) * (l2.y2 - l1.y1)) /
    det;
  const gamma =
    ((l1.y1 - l1.y2) * (l2.x2 - l1.x1) + (l1.x2 - l1.x1) * (l2.y2 - l1.y1)) /
    det;

  if (lambda > 0 && lambda < 1 && gamma > 0 && gamma < 1) {
    return {
      x: l1.x1 + lambda * (l1.x2 - l1.x1),
      y: l1.y1 + lambda * (l1.y2 - l1.y1),
    };
  }

  return null;
}
