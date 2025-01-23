import { selectedConversation } from "@/atoms/chatAtom.mjs";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { useSocket } from "@/Contexts/socketContext";
import { useLogout } from "@/hooks/useLogout.mjs";
import { Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";

export default function SettingsPage() {
  const [loadingFreezing, setLoadingFreezing] = useState(false);
  const setSelectedChat = useSetRecoilState(selectedConversation);
  const setUserState = useSetRecoilState(authenticatedUser);
  const socket = useSocket();
  const freezeAccount = async () => {
    try {
      setLoadingFreezing(true);
      const res = await fetch("/api/user/freeze", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setLoadingFreezing(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        console.log("Response from the user freezing server endpoint!");
        console.log(data);
        // logout the user !
        useLogout();
        setUserState(null);
        localStorage.removeItem("threads-user");
        setSelectedChat(null);
        socket?.close();
        //create a toast
        toaster.create({
          type: "success",
          description: data.message,
        });
      }
    } catch (error) {
      setLoadingFreezing(false);
      console.log(error);
    }
  };
  return (
    <>
      <Text my={1} fontWeight={"bold"}>
        Freeze Your Account
      </Text>
      <Text my={1}>You can unfreeze your account anytime by logging in.</Text>
      <Button
        size={"sm"}
        bg="red"
        onClick={freezeAccount}
        loading={loadingFreezing}
        loadingText={"freezing..."}
      >
        Freeze
      </Button>
    </>
  );
}
