import { useRecoilState } from "recoil";
import classNames from "classnames";
import { Paper } from "@mui/material";

import TattooEditor from "../tattooEditor";
import { tattooFilesInfoAtom } from "../../store/tattooFiles";
import { asideOpenAtom } from "../../store/asideOpen";
import { editingTattooAtom } from "../../store/editingTattoo";

import TattooImg from "./tattooImg";

import "./index.less";

const Aside = () => {
  const [tattooFilesInfo] = useRecoilState(tattooFilesInfoAtom);
  const [asideOpen] = useRecoilState(asideOpenAtom);
  const [editingTattooId, setEditingTattooId] = useRecoilState(editingTattooAtom);

  const cls = classNames("aside", { open: asideOpen });

  const getEditorCls = (id: string) => {
    return classNames("editor-wrapper", { editing: editingTattooId === id });
  };

  return (
    <div className={cls}>
      <nav>
        {tattooFilesInfo.map((fileInfo) => {
          return (
            <Paper
              className={"nav-item"}
              elevation={editingTattooId === fileInfo.id ? 3 : 0}
              key={fileInfo.id}
              onClick={() => {
                setEditingTattooId(fileInfo.id);
              }}
            >
              <TattooImg file={fileInfo.file} />
            </Paper>
          );
        })}
      </nav>

      <div className={"content"}>
        {tattooFilesInfo.map((fileInfo) => {
          return <TattooEditor info={fileInfo} key={fileInfo.id} className={getEditorCls(fileInfo.id)} />;
        })}
      </div>
    </div>
  );
};

export default Aside;
