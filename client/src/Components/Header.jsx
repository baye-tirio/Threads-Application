import authenticatedUser from "@/atoms/userAtom.mjs";
import { useColorMode } from "@/components/ui/color-mode";
import { Badge, Center, Flex, Image } from "@chakra-ui/react";
import React from "react";
import { useRecoilValue } from "recoil";
import CreatePost from "./CreatePost";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";

import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { CiHome } from "react-icons/ci";
import { unseenMessagesAtom } from "@/atoms/chatAtom.mjs";

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const authUser = useRecoilValue(authenticatedUser);
  const unseenMessages = useRecoilValue(unseenMessagesAtom);
  console.log("Authenticated user from the Header Component!");
  console.log(authUser);
  return (
    <>
      {authUser ? (
        <Flex justifyContent={"space-between"} mt={6} mb={12} w={"full"}>
          {/* Home Icon */}
          <Link to={`/`}>
            <CiHome size={"30px"} />
          </Link>
          {/* Threads Icon */}
          <Center>
            <Image
              cursor={"pointer"}
              alt="logo"
              w={6}
              src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
              onClick={toggleColorMode}
            />
          </Center>
          <Flex alignItems={"center"} gap={4}>
            {/* User Avatar Icon */}
            <Link to={`/${authUser.username}`}>
              <Avatar src={authUser.profilePicture} size={"xs"} />
            </Link>
            {/* Chat Icon */}
            <Link to={`/chat`}>
              <IoChatbubbleEllipsesOutline size={28} />
              {unseenMessages.length > 0 && (
                <Badge colorPalette="red"> + {unseenMessages.length}</Badge>
              )}
            </Link>
            {/* settings icon */}
            <Link to={`/settings`}>
              <IoSettingsOutline size={28} />
            </Link>
          </Flex>
          {/* Create Post button */}
          <CreatePost />
          {/* create reply */}
          {/* <CreateReply /> */}
        </Flex>
      ) : (
        <Center mt={6} mb={12}>
          <Image
            cursor={"pointer"}
            alt="logo"
            w={6}
            src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
            onClick={toggleColorMode}
          />
        </Center>
      )}
    </>
  );
}
