import { atom } from "recoil";

const authScreen = atom({
  key: "authScreenAtom",
  default: "login",
});
export default authScreen;
