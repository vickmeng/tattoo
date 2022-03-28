import "./App.less";
import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { RightOutlined } from "@ant-design/icons";
import classNames from "classnames";

import Aside from "./components/aside";
import TattooViewer from "./tattooViewer";
import { globalStore } from "./store/viewer";
import { asideOpenAtom } from "./store/asideOpen";
import Button from "./components/button";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const asideToggleCls = classNames("aside-toggle", { zoom: asideOpen });

  return (
    <div className={"main-container"}>
      <Aside />
      <div className={canvasWrapperCls} ref={containerRef}>
        <Button onClick={onAsideToggle} className={asideToggleCls}>
          <RightOutlined />
        </Button>
        <canvas style={{ width: "100%", height: "100%", display: "block" }} ref={canvasRef} />
      </div>
    </div>
  );
}

export default App;
