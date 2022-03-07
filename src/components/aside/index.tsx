import { useRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";

import { tattooFilesInfoAtom } from "../../store/tattooFiles";
import TattooCanvas from "../tattooCanvas";
import "./index.css";

const Aside = () => {
  const [tattooFilesInfo, setTattooFilesInfo] = useRecoilState(tattooFilesInfoAtom);

  return (
    <div className={"aside"}>
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
