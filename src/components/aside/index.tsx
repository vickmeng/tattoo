import { useRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";

import { tattooFilesInfoAtom } from "../../store/tattooFiles";
import { asideOpenAtom } from "../../store/asideOpen";
import TattooCanvas from "../tattooCanvas";

import "./index.less";

const Aside = () => {
  const [tattooFilesInfo, setTattooFilesInfo] = useRecoilState(tattooFilesInfoAtom);
  const [asideOpen] = useRecoilState(asideOpenAtom);

  const cls = classNames("aside", { open: asideOpen });

  return (
    <div className={cls}>
      <div>
        {tattooFilesInfo.map((fileInfo) => {
          return <TattooCanvas info={fileInfo} key={fileInfo.id} />;
        })}

        {tattooFilesInfo.map((fileInfo) => {
          return <p key={fileInfo.id}>{fileInfo.id}</p>;
        })}
      </div>

      <input
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
    </div>
  );
};

export default Aside;
