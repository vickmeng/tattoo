import { useEffect, useRef } from "react";
import "./index.less";

import { ITattooInfo } from "../../types";
import { globalStore } from "../../store/viewer";

interface IProps {
  className: string;
  info: ITattooInfo;
}

const TattooCanvas = ({ info, className }: IProps) => {
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
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          globalStore.tattooViewer!.addTattoo(canvas);
        };
      }
    };
  };

  return (
    <div className={className}>
      <div className={"tattoo-viewer-wrapper"}>
        <canvas id={info.id} ref={canvasRef} />
      </div>

      <div className={"edit-panel"}>2</div>
    </div>
  );
};

export default TattooCanvas;
