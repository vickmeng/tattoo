import { atom } from "recoil";

export const editingTattooAtom = atom<string | undefined>({
  key: "editingTattooAtom",
  default: undefined,
});
