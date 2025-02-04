import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import { Box, Center, Container, Spinner } from "@chakra-ui/react";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./Components/Header";
import { toaster, Toaster } from "./components/ui/toaster";
import AuthPage from "./pages/AuthPage";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import authenticatedUser from "./atoms/userAtom.mjs";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import LogoutButton from "./Components/LogoutButton";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import { useEffect, useState } from "react";
function CheckAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuth] = useRecoilState(authenticatedUser);
  useEffect(() => {
    const useCheckAuth = async () => {
      try {
        const res = await fetch("/api/authentication/checkAuth");
        const data = await res.json();
        if (!data.success) {
          console.log(
            "Failed to check the authentication status of the user : "
          );
          console.log(data);
          setAuth(null);
        } else {
          // means that the user is authenticated
          console.log("Result from checkAuth function are : ");
          console.log(data);
          // set the local storage to the authenticated user
          localStorage.setItem("threads-user", JSON.stringify(data));
          setAuth(data.user);
        }
      } catch (error) {
        console.log(error);
        toaster.create({
          type: "error",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    useCheckAuth();
  }, []);
  if (loading)
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  if (authUser) return children;
  else return <Navigate to="/auth" />;
}
function RedirectHome({ children }) {
  const authUser = useRecoilValue(authenticatedUser);
  if (authUser) return <Navigate to="/" />;
  else return children;
}

function App() {
  const authUser = useRecoilValue(authenticatedUser);
  //getting the current rendered page path
  const { pathname } = useLocation();
  console.log("The pathname variable as from the App jsx component");
  console.log(pathname);
  return (
    <Box position={"relative"} width={"full"}>
      <Container maxW={pathname === "/" ? "900px" : "700px"}>
        <Header />
        {authUser && <LogoutButton />}
        <Routes>
          <Route
            path="/"
            element={
              <CheckAuth>
                <HomePage />
              </CheckAuth>
            }
          />
          <Route
            path="/auth"
            element={
              <RedirectHome>
                <AuthPage />
              </RedirectHome>
            }
          />
          <Route
            path="/chat"
            element={
              <CheckAuth>
                <ChatPage />
              </CheckAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <CheckAuth>
                <SettingsPage />
              </CheckAuth>
            }
          />
          <Route
            path="/:username"
            element={
              <CheckAuth>
                <UserPage />
              </CheckAuth>
            }
          />
          <Route
            path="/update"
            element={
              <CheckAuth>
                <UpdateProfilePage />
              </CheckAuth>
            }
          />
          <Route
            path="/:username/post/:postId"
            element={
              <CheckAuth>
                <PostPage />
              </CheckAuth>
            }
          />
        </Routes>
        <Toaster />
      </Container>
    </Box>
  );
}
export default App;
