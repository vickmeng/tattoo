import { atom } from "recoil";

export const asideOpenAtom = atom<boolean>({
  key: "asideOpenAtom",
  default: false,
});
