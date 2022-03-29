import "./App.less";
import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AddIcon from "@mui/icons-material/Add";

import Aside from "./components/aside";
import TattooViewer from "./tattooViewer";
import { globalStore } from "./store/viewer";
import { asideOpenAtom } from "./store/asideOpen";
import { tattooFilesInfoAtom } from "./store/tattooFiles";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tattooFilesInfo, setTattooFilesInfo] = useRecoilState(tattooFilesInfoAtom);

  const [asideOpen, setAsideOpen] = useRecoilState(asideOpenAtom);

  useEffect(() => {
    globalStore.tattooViewer = new TattooViewer({
      container: containerRef.current!,
      canvas: canvasRef.current!,
      onInitSuccess() {
        globalStore.tattooViewer!.resize();
      },
    });
  }, []);

  const onAsideToggle = () => {
    setAsideOpen(!asideOpen);

    setTimeout(() => {
      globalStore.tattooViewer?.resize();
    }, 400);
  };

  const canvasWrapperCls = classNames("canvas-wrapper", { zoom: asideOpen });

  const asideToggleCls = classNames("aside-toggle", { bark: asideOpen, editing: asideOpen });

  return (
    <div className={"main-container"}>
      <Aside />
      <div className={canvasWrapperCls} ref={containerRef}>
        <Button onClick={onAsideToggle} variant={asideOpen ? "text" : "contained"} className={asideToggleCls}>
          <ArrowForwardIosIcon />
        </Button>

        <label htmlFor="upload-input">
          <input
            id={"upload-input"}
            type={"file"}
            accept={"image/*"}
            onChange={(e) => {
              const file = e.target.files![0];
              setTattooFilesInfo([
                ...tattooFilesInfo,
                {
                  id: uuidv4(),
                  file,
                },
              ]);
            }}
          />
          <Button className={"add-tattoo"} variant={"contained"} component="span">
            <AddIcon />
          </Button>
        </label>

        <canvas style={{ width: "100%", height: "100%", display: "block" }} ref={canvasRef} />
      </div>
    </div>
  );
}

export default App;
