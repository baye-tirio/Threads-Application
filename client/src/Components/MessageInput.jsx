import {
  conversationMessages,
  conversations,
  selectedConversation,
} from "@/atoms/chatAtom.mjs";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
import { Input } from "@chakra-ui/react";
import React, { useState } from "react";
import { IoIosSend } from "react-icons/io";
import { useRecoilValue, useSetRecoilState } from "recoil";

const MessageInput = ({ receiver }) => {
  const setConversationMessages = useSetRecoilState(conversationMessages);
  const selectedChat = useRecoilValue(selectedConversation);
  const editConversationDetails = useSetRecoilState(conversations);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    try {
      setMessageText(e.target.value);
    } catch (error) {
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  const sendMessage = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiver, text: messageText }),
      });
      const data = await res.json();
      setLoading(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        setLoading(false);
        console.log("Response from the server when sending a message");
        console.log(data);
        //setting the new messages at the front so that we see it . don't think we gon need this with socket.io implemented
        setConversationMessages((prevState) => [...prevState, data.message]);
        //update the conversation especially the new one so that we don't have to reload to see the messages
        editConversationDetails((prevState) =>
          prevState.map((conversation) => {
            if (conversation._id === selectedChat._id) {
              return {
                ...conversation,
                _id: data.message.conversationId,
                lastMessage: {
                  senderId: data.message.sender,
                  text: data.message.text,
                  _id: data.message._id,
                },
              };
            } else return conversation;
          })
        );
        setMessageText("");
        toaster.create({
          type: "success",
          description: "successfully sent the message!",
        });
      }
    } catch (error) {
      setLoading(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  return (
    <form>
      <InputGroup
        endElement={
          <IoIosSend
            size={"24px"}
            color="green"
            onClick={sendMessage}
            cursor={"pointer"}
            aria-disabled={loading}
          />
        }
        w={"full"}
      >
        <Input
          w={"full"}
          placeholder={"Type a message..."}
          onChange={handleChange}
          value={messageText}
        />
      </InputGroup>
    </form>
  );
};

export default MessageInput;
