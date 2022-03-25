import React from "react";
import ReactDOM from "react-dom";
import { RecoilRoot } from "recoil";
import "antd/dist/antd.css";
import "./index.less";

import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById("root")
);
