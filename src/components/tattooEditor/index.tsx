import { useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { Button, Slider } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { debounce } from "lodash";
import classNames from "classnames";

import { ITattooInfo } from "../../types";
import { loadingAtom } from "../../store/loading";
import { globalStore } from "../../store/viewer";
import { editingTattooIdAtom } from "../../store/editingTattooId";
import "./index.less";

interface IProps {
  info: ITattooInfo;
}

const TattooCanvas = ({ info }: IProps) => {
  const [scale, setScale] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setLoading] = useRecoilState(loadingAtom);
  const [editingTattooId] = useRecoilState(editingTattooIdAtom);

  useEffect(() => {
    loadCanvas();
    // eslint-disable-next-line
  }, []);

  const onScale = useMemo(() => {
    return debounce((value: number) => {
      const scaleValue = Math.max(value, 0.1);
      globalStore.tattooViewer?.scale(info.id, scaleValue);
    }, 300);
  }, [info.id]);

  useEffect(() => {
    onScale(scale);
  }, [onScale, scale]);

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

  const onRotate = (value: number) => {
    globalStore.tattooViewer?.rotate(info.id, value);
  };

  const className = classNames("tattoo-editor-wrapper", { editing: info.id === editingTattooId });

  return (
    <div className={className}>
      <canvas className={"tattoo"} id={info.id} ref={canvasRef} />

      <div className={"edit-panel"}>
        <div>旋转</div>
        <Slider
          defaultValue={0}
          min={-1 * Math.PI * 10}
          max={Math.PI * 10}
          onChangeCommitted={(e, v) => {
            onRotate((v as number) / 10);
          }}
        />
        <div>尺寸(倍数)</div>

        <Button
          onClick={() => {
            const value = scale * 10000 - 0.05 * 10000;
            setScale(value / 10000);
          }}
        >
          <RemoveIcon />
        </Button>

        {scale}

        <Button
          onClick={() => {
            const value = scale * 10000 + 0.05 * 10000;
            setScale(value / 10000);
          }}
        >
          <AddIcon />
        </Button>
      </div>
    </div>
  );
};

export default TattooCanvas;
