import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";

import { ITattooInfo } from "../../types";
import { globalStore } from "../../store/viewer";
import { loadingAtom } from "../../store/loading";
import "./index.less";

interface IProps {
  className: string;
  info: ITattooInfo;
}

const TattooCanvas = ({ info, className }: IProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setLoading] = useRecoilState(loadingAtom);

  useEffect(() => {
    loadCanvas();
    // eslint-disable-next-line
  }, []);

  const loadCanvas = () => {
    setLoading(true);

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

      setLoading(false);
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
