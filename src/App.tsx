import "./App.less";
import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import classNames from "classnames";

import Aside from "./components/aside";
import TattooViewer from "./tattooViewer";
import { globalStore } from "./store/viewer";
import { asideOpenAtom } from "./store/asideOpen";

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

    Array(10)
      .fill(null)
      .forEach((v, i) => {
        setTimeout(() => {
          globalStore.tattooViewer?.resize();
        }, i * 40);
      });
  };

  const canvasWrapperCls = classNames("canvas-wrapper", { zoom: asideOpen });

  return (
    <div className={"main-container"}>
      <Aside />
      <div className={canvasWrapperCls} ref={containerRef}>
        <Button
          onClick={onAsideToggle}
          className={"aside-toggle"}
          type="primary"
          shape="circle"
          icon={<SearchOutlined />}
        />
        <canvas style={{ width: "100%", height: "100%", display: "block" }} ref={canvasRef} />
      </div>
    </div>
  );
}

export default App;
