import { useState } from "react";
import classNames from "classnames";

import "./index.less";
import { globalStore } from "../../store/viewer";

// 0xffdbac

const colors = ["fee3d4", "ffdbac", "f2ccb7", "dfaa8b", "d19477", "bc644d"];

const SkinEditor = () => {
  const [color, setColor] = useState("ffdbac");

  return (
    <div className={"skin-editor"}>
      {colors.map((_color) => {
        return (
          <div
            onClick={() => {
              setColor(_color);
              globalStore.tattooViewer?.setSkin(Number(`0x${_color}`));
            }}
            className={classNames("color-radio", { active: _color === color })}
            key={_color}
            style={{ backgroundColor: `#${_color}` }}
          />
        );
      })}
    </div>
  );
};

export default SkinEditor;
