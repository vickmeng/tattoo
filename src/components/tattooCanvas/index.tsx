import { useEffect, useRef } from "react";

import { ITattooInfo } from "../../types";

interface IProps {
  info: ITattooInfo;
}

const TattooCanvas = ({ info }: IProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadCanvas();
    // eslint-disable-next-line
  }, []);

  const loadCanvas = () => {
    const canvas = canvasRef.current!;

    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    const reader = new FileReader();
    reader.readAsDataURL(info.file);
    reader.onload = (e) => {
      if (e.target?.readyState === FileReader.DONE) {
        img.src = e.target.result as string;
        img.onload = () => {
          // eslint-disable-next-line no-console
          console.log("img loaded");

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
      }
    };
  };

  return <canvas id={info.id} ref={canvasRef} />;
};

export default TattooCanvas;
