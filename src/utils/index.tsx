/**
 *  (canvas: HTMLCanvasElement)=>[x,y]
 */
export const computeTattooDefaultSize = (canvas: HTMLCanvasElement): [number, number] => {
  const { width, height } = canvas;
  const min = Math.min(canvas.width, canvas.height);

  const _resize = (resizedMin: number): [number, number] => {
    const resizeRate = min / resizedMin;
    return [width / resizeRate, height / resizeRate];
  };

  if (min > 1000) {
    return _resize(400);
    // 大图
  } else if (min > 500) {
    return _resize(160);
    // 中图
  } else {
    return _resize(80);
  }
};
