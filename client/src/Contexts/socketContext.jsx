import { unseenMessagesAtom } from "@/atoms/chatAtom.mjs";
import { onlineUsers } from "@/atoms/socketAtom.mjs";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { io } from "socket.io-client";
import notificationSound from "../assets/sounds/incomingMessageNotificationSound.wav";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const setOnlineUsers = useSetRecoilState(onlineUsers);
  const authUser = useRecoilValue(authenticatedUser);
  const [unseenMessages, setUnseenMessages] =
    useRecoilState(unseenMessagesAtom);
  // const selectedChat = useRecoilValue(selectedConversation);
  // const setMessages = useSetRecoilState(conversationMessages);
  // const setChats = useSetRecoilState(conversations);
  // const chats = useRecoilValue(conversations);
  useEffect(() => {
    //io is a function that establishes a connection to the socket server .. typeshit we sent some data in the query object on top of that shit too shiii
    const socketConnection = io("http://localhost:5900", {
      query: {
        username: authUser?.username,
      },
    });
    socketConnection.on("onlineUsersEvent", (users) => {
      // console.log("New user event");
      // console.log(users);
      setOnlineUsers(users);
    });
    socketConnection.on("incommingMessageEvent", (incommingMessage) => {
      // incomming message handling logic
      // notification sounds plus other logic
      const sound = new Audio(notificationSound);
      if (!document.hasFocus()) {
        sound.play();
      }
      setUnseenMessages((prevState) => [incommingMessage, ...prevState]);
    });
    //In case we'd want to use the socket object anywhere else typeshit
    setSocket(socketConnection);
    return () => {
      if (socket) {
        //close the connection
        socket.close();
      }
    };
  }, [authUser?._id]);
  console.log("socket provider rendered / called");
  // console.log("Selected chat from the socket provider perspective : ");
  // console.log(selectedChat);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
