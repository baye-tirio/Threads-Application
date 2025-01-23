import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { Box, Container } from "@chakra-ui/react";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./Components/Header";
import { Toaster } from "./components/ui/toaster";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import authenticatedUser from "./atoms/userAtom.mjs";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import LogoutButton from "./Components/LogoutButton";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
function CheckAuth({ children }) {
  const authUser = useRecoilValue(authenticatedUser);
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
