import {
  Box,
  Button,
  Flex,
  Link,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { toaster } from "@/components/ui/toaster";
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/components/ui/menu";
import { Avatar } from "@/components/ui/avatar";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useRecoilValue } from "recoil";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { useParams, Link as RouterLink } from "react-router-dom";
import FollowButton from "./FollowButton";
export default function UserHeader({ user, setRenderType, renderType }) {
  const authUser = useRecoilValue(authenticatedUser);
  const { username } = useParams();
  const copyUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      toaster.create({
        description: "Copied!",
        duration: 3000,
        type: "success",
      });
      console.log("Url copied to clipboard");
    });
  };
  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            <Text
              fontSize={"xs"}
              bg={"customDarkGray"}
              color={"customLightGray"}
              p={1}
              borderRadius={"full"}
            >
              threads.net
            </Text>
          </Flex>
        </Box>
        <Box>
          <Avatar
            name="Mark Zukerberg"
            src={user.profilePicture}
            size={{
              base: "md",
              md: "xl",
            }}
          />
        </Box>
      </Flex>
      <Text>{user.bio}</Text>
      {authUser.username === username ? (
        <RouterLink to={"/update"}>
          <Button size={"sm"}>Update Profile</Button>
        </RouterLink>
      ) : (
        <FollowButton isFollowing={user.isFollowing} userId={user._id} />
      )}
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text color={"customLightGray"}>{user.followersCount} followers</Text>
          <Text color={"customLightGray"}>{user.followingCount} following</Text>
          <Box w={1} h={1} bg={"customLightGray"} borderRadius={"full"}></Box>
          <Link color={"customLightGray"}>instagram.com</Link>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <BsInstagram size={24} cursor={"pointer"} />
          </Box>
          <Box className="icon-container">
            <MenuRoot>
              <MenuTrigger asChild>
                <CgMoreO size={24} cursor={"pointer"} />
              </MenuTrigger>
              <Portal>
                <MenuContent bg={"customLightGray"}>
                  <MenuItem bg={"customLightGray"} onClick={copyUrl}>
                    Copy Link
                  </MenuItem>
                </MenuContent>
              </Portal>
            </MenuRoot>
          </Box>
        </Flex>
      </Flex>

      <Flex width={"full"}>
        <Flex
          flex={1}
          borderBottom={
            renderType === "threads"
              ? useColorModeValue("1px solid gray", "1.5px solid white")
              : useColorModeValue("1.5px solid white", "1px solid gray")
          }
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setRenderType("threads")}
        >
          <Text fontWeight={"bold"}>Threads</Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={
            renderType === "replies"
              ? useColorModeValue("1px solid gray", "1.5px solid white")
              : useColorModeValue("1.5px solid white", "1px solid gray")
          }
          justifyContent={"center"}
          color={"customLightGray"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setRenderType("replies")}
        >
          <Text fontWeight={"bold"}>Replies</Text>
        </Flex>
      </Flex>
    </VStack>
  );
}
