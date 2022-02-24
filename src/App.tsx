import "./App.css";
import { useEffect, useRef } from "react";

import Aside from "./components/aside";
import TattooViewer from "./tattooViewer";
import { globalStore } from "./store/viewer";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    globalStore.tattooViewer = new TattooViewer({
      container: containerRef.current!,
      canvas: canvasRef.current!,
    });
    // eslint-disable-next-line
  }, []);

  return (
    <div className={"main-container"}>
      <Aside />
      <div style={{ width: "100%", height: "100%" }} ref={containerRef}>
        <canvas style={{ width: "100%", height: "100%", display: "block" }} ref={canvasRef} />
      </div>
    </div>
  );
}

export default App;
