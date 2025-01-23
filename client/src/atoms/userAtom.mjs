import { atom } from "recoil";

const authenticatedUser = atom({
  key: "authenticated-user",
  default: JSON.parse(localStorage.getItem("threads-user"))?.user,
});
export default authenticatedUser;
