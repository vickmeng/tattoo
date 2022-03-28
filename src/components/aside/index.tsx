import { useRecoilState } from "recoil";
import classNames from "classnames";

import TattooEditor from "../tattooEditor";
import { tattooFilesInfoAtom } from "../../store/tattooFiles";
import { asideOpenAtom } from "../../store/asideOpen";
import { editingTattooAtom } from "../../store/editingTattoo";
import "./index.less";

import TattooImg from "./tattooImg";

const Aside = () => {
  const [tattooFilesInfo] = useRecoilState(tattooFilesInfoAtom);
  const [asideOpen] = useRecoilState(asideOpenAtom);
  const [editingTattoo, setEditingTattoo] = useRecoilState(editingTattooAtom);

  const cls = classNames("aside", { open: asideOpen });

  const getNavItemCls = (id: string) => {
    return classNames("nav-item", { editing: editingTattoo === id });
  };

  const getEditorCls = (id: string) => {
    return classNames("editor-wrapper", { editing: editingTattoo === id });
  };

  return (
    <div className={cls}>
      <nav>
        {tattooFilesInfo.map((fileInfo) => {
          return (
            <div
              key={fileInfo.id}
              className={getNavItemCls(fileInfo.id)}
              onClick={() => {
                setEditingTattoo(fileInfo.id);
              }}
            >
              <TattooImg file={fileInfo.file} />
            </div>
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
