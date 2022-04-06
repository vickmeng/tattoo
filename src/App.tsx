import "./App.less";
import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import TattooViewer from "./tattooViewer";
import { globalStore } from "./store/viewer";
import { tattooFilesInfoAtom } from "./store/tattooFiles";
import { loadingAtom } from "./store/loading";
import TattooCanvas from "./components/tattooEditor";
import { editingTattooIdAtom } from "./store/editingTattooId";
import SkinEditor from "./components/skinEditor";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tattooFilesInfo, setTattooFilesInfo] = useRecoilState(tattooFilesInfoAtom);

  const [loading, setLoading] = useRecoilState(loadingAtom);

  const [, setEditingTattooId] = useRecoilState(editingTattooIdAtom);

  useEffect(() => {
    setLoading(true);
    globalStore.tattooViewer = new TattooViewer({
      container: containerRef.current!,
      canvas: canvasRef.current!,
      onInitSuccess() {
        globalStore.tattooViewer!.resize();
        setLoading(false);
      },
      activeTattooIdChange(id) {
        setEditingTattooId(id);
      },
    });
    // eslint-disable-next-line
  }, []);

  return (
    <div className={"main-container"}>
      <Backdrop open={loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {tattooFilesInfo.map((info) => {
        return <TattooCanvas info={info} key={info.id} />;
      })}

      <SkinEditor />

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

      {/* <Aside /> */}
      <div className={"canvas-wrapper"} ref={containerRef}>
        <canvas style={{ width: "100%", height: "100%", display: "block" }} ref={canvasRef} />
      </div>
    </div>
  );
}

export default App;
