import { Avatar } from "@/components/ui/avatar";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton";
import { Center, Flex, Image, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  conversationMessages,
  selectedConversation,
  unseenMessagesAtom,
} from "@/atoms/chatAtom.mjs";
import { toaster } from "@/components/ui/toaster";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { useSocket } from "@/Contexts/socketContext";

const MessageContainer = () => {
  const setUnseenMessages = useSetRecoilState(unseenMessagesAtom);
  const chat = useRecoilValue(selectedConversation);
  //const updateConversations = useSetRecoilState(conversations);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useRecoilState(conversationMessages);
  const authUser = useRecoilValue(authenticatedUser);
  const socket = useSocket();
  // console.log("socket from container!");
  // console.log(socket);
  const username = chat.participants.find(
    (participant) => participant.username !== authUser.username
  ).username;
  const profilePicture = chat.participants.find(
    (participant) => participant.username !== authUser.username
  ).profilePicture;
  //function to scoll to view
  const lastMessage = useRef(null);
  const scrollToView = (node) => {
    try {
      lastMessage.current = node;
      lastMessage.current.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      //console.log(error);
    }
  };
  //A function to get them messages from the backend/server
  const getConversationMessages = async () => {
    try {
      const regEx = new RegExp("new_chat", "i");
      if (regEx.test(chat._id.toString())) {
        console.log("Should display say hi 👋");
        console.log("Loading messages value : ", loadingMessages);
        setLoadingMessages(false);
        setMessages([]);
        return;
      } else {
        setLoadingMessages(true);
        const res = await fetch(`/api/chat/conversation/${chat._id}`);
        const data = await res.json();
        setLoadingMessages(false);
        if (!data.success) {
          toaster.create({
            type: "error",
            description: data.error,
          });
        } else {
          setMessages(data.messages);
          console.log("THE MESSAGES RECEIVED FROM THE SERVER ARE : ");
          console.log(data.messages);
          //If the last message was sent to us if not then we've seen all the messages from that conversation
          const lastMessage = [...data.messages].pop();
          if (lastMessage.sender !== authUser._id) {
            setUnseenMessages((prevState) =>
              prevState.filter(
                (m) => m.conversationId !== lastMessage.conversationId
              )
            );
          }
          //end of the logic for updating the messages we done seen
        }
      }
    } catch (error) {
      console.log("THE LATEST ERROR!");
      console.log(error);
      setLoadingMessages(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  //UseEffect to register the newMessage event handler
  useEffect(() => {
    console.log(
      "Registering / Reregistering the newMessage Event at the container level: "
    );
    //console.log(socket);
    socket?.on("newMessageEvent", (newMessage) => {
      console.log("NewMessage event from the chat messageContainer!");
      console.log({ newMessage, chat });
      if (newMessage.conversationId === chat._id) {
        setMessages((prevState) => [...prevState, newMessage]);
      }
      //dat message done already been seen typeshit
      // setUnseenMessages((prevState) =>
      //   prevState.filter((m) => m.conversationId !== newMessage.conversationId)
      // );
    });
    return () => socket?.off("newMessageEvent");
  }, [username]);
  //UseEffect to load up the conversation messages
  useEffect(() => {
    console.log("Messages fetching useEffect of the container");
    getConversationMessages();
  }, [username]);
  // UseEffect for seen event
  useEffect(() => {
    console.log("seenMessageEvent! at the message container level");
    socket?.on("seenMessageEvent", ({ conversationId }) => {
      if (chat._id === conversationId) {
        setMessages((prevState) =>
          prevState.map((message) => {
            return { ...message, seen: true };
          })
        );
      }
    });
  }, [username]);
  console.log("Rendering the chat container and the selected chat is ");
  console.log(chat);
  return (
    <Flex
      flex={70}
      bg={useColorModeValue("gray.100", "customDarkGray")}
      borderRadius={"md"}
      flexDirection={"column"}
      p={2}
      //border={"solid blue 2px"}
    >
      {/* Message Container header  */}
      <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
        {/* Message Header */}
        {/* User Avatar */}
        <Avatar src={profilePicture} size={"sm"} />
        {/* Username and verification badge */}
        <Text display={"flex"} alignItems={"center"}>
          {username} <Image src="/verified.png" w={4} h={4} ml={1} />
        </Text>
      </Flex>
      {/* we should have a border right here */}
      {/* the actual messages come here (Message container in other words) ! */}
      <Flex
        flexDirection={"column"}
        gap={4}
        p={1}
        my={2}
        height={"65vh"}
        overflowY={"auto"}
        // border={"solid brown 2px"}
      >
        {/* The component below renders the loading skeleton for the messages container */}
        {loadingMessages &&
          [...Array(4)].map((_, i) => (
            <Flex
              key={i}
              gap={2}
              alignItems={"center"}
              padding={1}
              borderRadius={"md"}
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Flex flexDirection={"column"} gap={2}>
                <Skeleton h={"8px"} w={"250px"} />
                <Skeleton h={"8px"} w={"250px"} />
                <Skeleton h={"8px"} w={"250px"} />
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))}
        {!loadingMessages && messages.length === 0 && (
          <Center>
            <Text>Say Hellow 👋</Text>
          </Center>
        )}
        {!loadingMessages &&
          messages.length > 0 &&
          messages?.map((message, i) => (
            <Message
              ref={i + 1 === messages?.length ? scrollToView : null}
              key={message._id}
              ownMessage={message.sender === authUser._id ? true : false}
              message={message}
              avatar={profilePicture}
              username={username}
              index={i}
            />
          ))}
      </Flex>
      {/* The input message goes here!  */}
      <MessageInput receiver={username} />
    </Flex>
  );
};

export default MessageContainer;
