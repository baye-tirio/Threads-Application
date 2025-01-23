// import { Avatar } from "@/components/ui/avatar";
import { selectedConversation } from "@/atoms/chatAtom.mjs";
import { onlineUsers } from "@/atoms/socketAtom.mjs";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import {
  Circle,
  Flex,
  Float,
  Image,
  Stack,
  Text,
  Avatar,
  Box,
} from "@chakra-ui/react";
import { BsCheck2All } from "react-icons/bs";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

const Conversation = ({ chat }) => {
  const socketOnlineUsers = useRecoilValue(onlineUsers);
  const colorMode = useColorMode().colorMode;
  const authUser = useRecoilValue(authenticatedUser);
  const [selectedChat, setSelectedChat] = useRecoilState(selectedConversation);
  const username = chat.participants?.find(
    (participant) => participant?.username !== authUser.username
  )?.username;
  const profilePicture = chat.participants?.find(
    (participant) => participant?.username !== authUser.username
  )?.profilePicture;
  return (
    <Flex
      onClick={() => setSelectedChat(chat)}
      alignItems={"center"}
      p={"1"}
      gap={4}
      _hover={{
        cursor: "pointer",
        bg: useColorModeValue("gray.600", "customDarkGray"),
        color: "white",
      }}
      bg={
        chat._id === selectedChat?._id
          ? colorMode === "light"
            ? "gray.400"
            : "gray.600"
          : ""
      }
      borderRadius={"md"}
    >
      {/* Was a wrapItem over here */}
      <>
        <Avatar.Root
          colorPalette="green"
          variant="subtle"
          size={{
            base: "xs",
            sm: "sm",
            md: "md",
          }}
          src={profilePicture}
        >
          <Avatar.Image src={profilePicture} />
          <Avatar.Fallback>DA</Avatar.Fallback>
          {socketOnlineUsers?.includes(username) && (
            <Float placement="bottom-end" offsetX="1" offsetY="1">
              <Circle
                bg="green.500"
                size="8px"
                outline="0.2em solid"
                outlineColor="bg"
              />
            </Float>
          )}
        </Avatar.Root>
      </>
      {/* For the username */}
      <Stack direction={"column"} fontSize={"sm"}>
        <Text display={"flex"} alignItems={"center"} fontWeight={"700"}>
          {username} <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
        <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
          {chat.lastMessage?.senderId === authUser._id ? "You: " : ""}
          {/* This is for the seen or not seen checkmarks on the conversation itself */}
          {chat.lastMessage?.senderId === authUser._id && (
            <Box color={chat.lastMessage?.seen ? "blue.400" : ""}>
              <BsCheck2All size={16} />
            </Box>
          )}
          {/* End of the seen or not seen checkmarks on the converstion itself  */}
          {chat.lastMessage?.text}
        </Text>
      </Stack>
    </Flex>
  );
};

export default Conversation;
