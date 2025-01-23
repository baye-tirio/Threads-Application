import React from "react";
import { FiLogOut } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useBreakpointValue } from "@chakra-ui/react";
import { useLogout } from "@/hooks/useLogout.mjs";
import { useSocket } from "@/Contexts/socketContext";
import { useSetRecoilState } from "recoil";
import { selectedConversation } from "@/atoms/chatAtom.mjs";
import authenticatedUser from "@/atoms/userAtom.mjs";

export default function LogoutButton() {
  const setSelectedChat = useSetRecoilState(selectedConversation);
  const setUserState = useSetRecoilState(authenticatedUser);
  const socket = useSocket();
  const buttonPosition = useBreakpointValue({
    base: { bottom: "40px", left: "30px" }, // For small screens, position at bottom-left
    lg: { top: "30px", right: "40px" }, // For large screens, position at top-right
  });

  const handleLogout = async () => {
    await useLogout();
    setUserState(null);
    localStorage.removeItem("threads-user");
    setSelectedChat(null);
    socket?.close();
  };
  return (
    <Button
      position={"fixed"}
      size={"sm"}
      onClick={handleLogout}
      bg={useColorModeValue("gray.500", "gray.700")}
      color={useColorModeValue("black", "white")}
      {...buttonPosition}
    >
      <FiLogOut size={20} />
      Logout
    </Button>
  );
}
