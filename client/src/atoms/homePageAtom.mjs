import { atom } from "recoil";

export const homePosts = atom({
  key: "feed",
  default: null,
});
