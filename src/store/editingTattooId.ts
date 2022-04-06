import { atom } from "recoil";

export const editingTattooIdAtom = atom<string | null | undefined>({
  key: "editingTattooIdAtom",
  default: undefined,
});
