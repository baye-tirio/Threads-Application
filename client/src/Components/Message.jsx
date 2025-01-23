import authenticatedUser from "@/atoms/userAtom.mjs";
import { Avatar } from "@/components/ui/avatar";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { BsCheck2All } from "react-icons/bs";
import { forwardRef } from "react";
import { conversationMessages } from "@/atoms/chatAtom.mjs";
import { useSocket } from "@/Contexts/socketContext";

const Message = forwardRef((props, ref) => {
  const authUser = useRecoilValue(authenticatedUser);
  const messages = useRecoilValue(conversationMessages);
  const { ownMessage, message, avatar, index, username } = props;
  const socket = useSocket();
  if (index + 1 === messages.length && !ownMessage) {
    // emmit a messageSeen event with the conversationId and the server to the socket client to update the seen status
    console.log("Emmiting a seen message event from the client !");
    console.log("The socket value is : ");
    console.log(socket);
    socket?.emit("seenMessageEvent", {
      conversationId: message.conversationId,
      sender: username,
      lastSeenMessageId: message._id,
    });
  }
  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"} ref={ref}>
          <Text maxW={"350px"} bg={"blue.400"} p={1} borderRadius={"md"}>
            {message.text}
          </Text>
          {/* Delivered checkmarks */}
          <Box
            alignSelf={"flex-end"}
            ml={1}
            color={message.seen ? "blue.400" : ""}
            fontWeight={"bold"}
          >
            <BsCheck2All size={16} />
          </Box>
          {/* end of the delivered checkmarks */}
          <Avatar w={7} h={7} src={authUser.profilePicture} />
        </Flex>
      ) : (
        <Flex gap={2} alignSelf={"flex-start"} ref={ref}>
          <Avatar w={7} h={7} src={avatar} />
          <Text
            maxW={"350px"}
            bg={"gray.400"}
            p={1}
            borderRadius={"md"}
            color={"black"}
          >
            {message.text}
          </Text>
        </Flex>
      )}
    </>
  );
});
export default Message;
