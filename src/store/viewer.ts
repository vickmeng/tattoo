// import { atom } from "recoil";

import TattooViewer from "../tattooViewer";

// export const tattooViewerAtom = atom<TattooViewer | null>({
//   key: "tattooViewAtom",
//   default: null,
// });

interface IGlobalStore {
  tattooViewer: TattooViewer | null;
}

export const globalStore: IGlobalStore = {
  tattooViewer: null,
};
