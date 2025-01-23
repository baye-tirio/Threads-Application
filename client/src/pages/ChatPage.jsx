import {
  conversationMessages,
  conversations,
  selectedConversation,
} from "@/atoms/chatAtom.mjs";
import { onlineUsers } from "@/atoms/socketAtom.mjs";
import Conversation from "@/Components/Conversation";
import MessageContainer from "@/Components/MessageContainer";
import { useColorModeValue } from "@/components/ui/color-mode";
import { SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";
import { toaster } from "@/components/ui/toaster";
import { useSocket } from "@/Contexts/socketContext";
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { BiConversation } from "react-icons/bi";
import { MdSportsCricket } from "react-icons/md";
import { useRecoilState, useRecoilValue } from "recoil";
import { isConstructorDeclaration } from "typescript";
export default function ChatPage() {
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadingChatPage, setLoadingChatPage] = useState(true);
  const [chats, setChats] = useRecoilState(conversations);
  const selectedChat = useRecoilValue(selectedConversation);
  //This is only here because of the weird behavior when it comes to leaving the chat page and then comming back when there was a previous conversation on
  const messages = useRecoilValue(conversationMessages);
  const [searchTerm, setSearchTerm] = useState("");
  // const [socketOnlineUsers, setSocketOnlineUsers] = useRecoilState(onlineUsers);
  const handleSearchTerm = (e) => {
    try {
      setSearchTerm(e.target.value);
    } catch (error) {
      console.log(error);
    }
  };
  const getConversations = async () => {
    try {
      setLoadingConversation(true);
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      setLoadingConversation(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        setLoadingChatPage(false);
        setChats(data.conversations);
      }
    } catch (error) {
      setLoadingConversation(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  const handleSearch = async () => {
    try {
      setLoadingConversation(true);
      //If we typed something to search
      if (searchTerm) {
        const res = await fetch(
          `/api/chat/search/conversations?searchTerm=${searchTerm}`
        );
        const data = await res.json();
        setLoadingConversation(false);
        if (!data.success) {
          toaster.create({
            type: "error",
            description: data.error,
          });
        } else {
          console.log("Response from the server on search");
          console.log(data.matchedConversations);
          setChats(data.matchedConversations);
        }
      } else {
        //if the searchTerm is empty
        getConversations();
      }
    } catch (error) {
      setLoadingConversation(false);
      console.log(error);
    }
  };
  useEffect(() => {
    // console.log("Conversations fetching useEffect from the chat page");
    setLoadingChatPage(true);
    getConversations();
  }, []);
  // The sole purpose of this is to be able to update the last message even tho we have not opened the chat
  const socket = useSocket();
  useEffect(() => {
    console.log(
      "Registering / Reregistering the newMessage Event at the chat page level: "
    );
    console.log("socket value at this point : ");
    console.log(socket);
    socket?.on("newMessageEvent", (newMessage) => {
      console.log("newMessageEvent! from the chat page !");
      // console.log({ newMessage, selectedChat ,chats });
      setChats((prevState) =>
        prevState?.map((convo) => {
          if (convo._id === newMessage.conversationId) {
            //  console.log("found a chat to set and we setting right now !");
            return {
              ...convo,
              lastMessage: {
                senderId: newMessage.sender,
                text: newMessage.text,
              },
            };
          } else return convo;
        })
      );
    });
    // return () => socket?.off("newMessageEvent");
  }, [selectedChat, socket, messages]);
  // This useEffect is for the purpose of listening to the seenMessages event and just in case the chat container is closed
  useEffect(() => {
    socket?.on("seenMessageEvent", ({ conversationId }) => {
      console.log("seenMessageEvent! at the chat page level !");
      setChats((prevState) =>
        prevState.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true,
              },
            };
          } else return conversation;
        })
      );
    });
  }, [selectedChat, socket, messages]);
  console.log("Rendering the chat page");
  if (loadingChatPage)
    return (
      <Center p={5}>
        <Spinner size="xl" />{" "}
      </Center>
    );
  return (
    <Box
      position={"absolute"}
      left={"50%"}
      transform={"translateX(-50%)"}
      w={{
        base: "100%",
        md: "80%",
        lg: "80vw",
      }}
      p={4}
      gap={6}
      // border={"solid red 2px"}
    >
      {/* Outer container */}

      <Flex
        gap={4}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        maxW={{
          sm: "400px",
          md: "full",
        }}
        mx={"auto"}
        // border={"solid green 2px"}
      >
        {/* The left part of the chat page */}
        <Flex
          flex={30}
          gap={2}
          direction={"column"}
          maxW={{
            sm: "250px",
            md: "full",
          }}
          mx={"auto"}
          height={"90vh"}
          overflowY={"auto"}
          // border={"solid yellow 2px"}
        >
          <Text
            fontWeight={700}
            color={useColorModeValue("gray.600", "gray.400")}
          >
            Your Conversations
          </Text>
          <form>
            <Flex alignItems={"center"} gap={2}>
              <Input
                placeholder="search..."
                value={searchTerm}
                onChange={handleSearchTerm}
              />
              <Button size={"sm"} onClick={handleSearch}>
                <BiSearch />
              </Button>
            </Flex>
          </form>
          {/* some loading dop shit */}
          {loadingConversation &&
            [...Array(4)].map((_, i) => {
              return (
                <Flex
                  key={i}
                  gap={4}
                  alignItems={"center"}
                  padding={"1"}
                  borderRadius={"md"}
                >
                  <HStack width="full">
                    <SkeletonCircle size="10" />
                    <SkeletonText noOfLines={1} />
                  </HStack>
                </Flex>
              );
            })}
          {/* If we done loaded the chats but the person hasn't had no convo before */}
          {!loadingConversation && chats?.length == 0 && (
            <Center>
              <Text>Search a User!</Text>
            </Center>
          )}
          {/* Once we done loading a and we have conversations */}
          {!loadingConversation &&
            chats?.map((chat) => <Conversation chat={chat} key={chat._id} />)}
        </Flex>
        {/* Done loading the conversation but have not yet selected a chat */}
        {!loadingChatPage && !selectedChat && (
          <Flex
            flex={70}
            borderRadius={"md"}
            p={2}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            //border={"solid blue 2px"}
            height={"90vh"}
          >
            <BiConversation size={70} />
            <Text fontSize={20}> Select a conversation to start messaging</Text>
          </Flex>
        )}
        {/* Done loading a conversation and have selected a chat already */}
        {!loadingChatPage && selectedChat && <MessageContainer />}
      </Flex>
    </Box>
  );
}
