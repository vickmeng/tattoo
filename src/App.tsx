import "./App.less";
import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { RightOutlined, PlusOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";

import Aside from "./components/aside";
import TattooViewer from "./tattooViewer";
import { globalStore } from "./store/viewer";
import { asideOpenAtom } from "./store/asideOpen";
import Button from "./components/button";
import { tattooFilesInfoAtom } from "./store/tattooFiles";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        <Button onClick={onAsideToggle} className={asideToggleCls}>
          <RightOutlined />
        </Button>

        <Button
          className={"add-tattoo"}
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          <PlusOutlined />
        </Button>

        <input
          ref={inputRef}
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

        <canvas style={{ width: "100%", height: "100%", display: "block" }} ref={canvasRef} />
      </div>
    </div>
  );
}

export default App;
