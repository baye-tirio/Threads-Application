import authScreenAtom from "@/atoms/authPageAtom.mjs";
import authenticatedUser from "@/atoms/userAtom.mjs";
import LogInCard from "@/Components/LogInCard";
import SignupCard from "@/Components/SignUpCard";
import { useRecoilValue } from "recoil";

export default function AuthPage() {
  const user = useRecoilValue(authenticatedUser);
  console.log("The authenticated user is:");
  console.log(user);
  const authScreenState = useRecoilValue(authScreenAtom);
  return <>{authScreenState === "login" ? <LogInCard /> : <SignupCard />}</>;
}
