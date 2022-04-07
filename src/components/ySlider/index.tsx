import { Slider } from "@mui/material";

import "./index.less";
import { globalStore } from "../../store/viewer";
const YSlider = () => {
  return (
    <div className={"y-slider-wrapper"}>
      <Slider
        onChange={(e, v) => {
          globalStore.tattooViewer?.lookAt(v as number);
        }}
        size="small"
        aria-label="Y"
        orientation="vertical"
        defaultValue={1000}
        min={0}
        max={2000}
      />
    </div>
  );
};

export default YSlider;
