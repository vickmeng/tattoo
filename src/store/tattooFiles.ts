import { atom } from "recoil";

import { ITattooInfo } from "../types";

export const tattooFilesInfoAtom = atom<ITattooInfo[]>({
  key: "tattooFilesAtom",
  default: [],
});
