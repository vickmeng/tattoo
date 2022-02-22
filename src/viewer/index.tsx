import { useEffect, useRef } from "react";

import TattooViewer from "./tattooViewer";

const Viewer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tattooViewerRef = useRef<TattooViewer>();

  useEffect(() => {
    tattooViewerRef.current = new TattooViewer({
      container: containerRef.current!,
      canvas: canvasRef.current!,
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "block" }} ref={containerRef}>
      <canvas style={{ width: "100%", height: "100%", display: "block" }} ref={canvasRef} />
    </div>
  );
};

export default Viewer;
