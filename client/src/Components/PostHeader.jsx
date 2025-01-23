import authenticatedUser from "@/atoms/userAtom.mjs";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { MdDeleteOutline } from "react-icons/md";
import { toaster } from "@/components/ui/toaster";
import { getTimeElapsed } from "@/Utils/getTimeElapsed.mjs";
import { Flex, Image, Text } from "@chakra-ui/react";
import { useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { profilePosts } from "@/atoms/profilePageAtom.mjs";
import { repliedPost } from "@/atoms/postPageAtom.mjs";
import { useNavigate } from "react-router-dom";

export default function PostHeader({ username, time, postId }) {
  const currentRepliedPostValue = useRecoilValue(repliedPost);
  const setCurrentRepliedPostValue = useSetRecoilState(repliedPost);
  const setUserProfilePosts = useSetRecoilState(profilePosts);
  const authUser = useRecoilValue(authenticatedUser);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/post/delete/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setDeleteLoading(false);
      if (!data.success) {
        console.log("An error from the backend !");
        console.log(data.error);
        console.log(data.stack);
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        // delete the post from the profile posts atom for the UI upgrade and shit
        setUserProfilePosts((prevState) => ({
          ...prevState,
          userThread: prevState.userThread?.filter(
            (post) => post._id !== postId
          ),
          userReplies: prevState.userReplies?.filter(
            (post) => post._id !== postId
          ),
        }));
        //delete it from the replied post atom just in case we are on the post page
        if (currentRepliedPostValue.postId === data.deletedPost.parentPost) {
          setCurrentRepliedPostValue((prevState) => ({
            ...prevState,
            replies: prevState.replies?.filter(
              (reply) => reply._id !== data.deletedPost._id
            ),
          }));
        }
        //bug find a way to fix it because sometimes we done visit the post page first then out  of it and when we try to delete the same post from any other page then it would go to the home page and I don't want that
        if (data.deletedPost._id === currentRepliedPostValue.postId) {
          //If there was a way to know what page we was on then it would be very useful over here!
          navigate("/");
        }
        toaster.create({
          type: "success",
          description: data.message,
        });
      }
    } catch (error) {
      setDeleteLoading(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  return (
    <Flex justifyContent={"space-between"} w={"full"}>
      <Flex w={"full"} alignItems={"center"}>
        <Text fontSize={"sm"} fontWeight={"bold"}>
          {username}
        </Text>
        <Image src="/verified.png" w={4} h={4} ml={1} />
      </Flex>
      <Flex gap={4} alignItems={"center"}>
        <Text fontSize="sm" color="customLightGray">
          {getTimeElapsed(time)}
        </Text>
        {/* Menu */}
        <MenuRoot>
          <MenuTrigger>
            <BsThreeDots cursor={"pointer"} />
          </MenuTrigger>
          <MenuContent>
            {authUser.username === username && (
              <MenuItem value="rename">Edit</MenuItem>
            )}
            {authUser.username !== username && (
              <MenuItem value="export">Mute @{username}</MenuItem>
            )}
            {authUser.username === username && (
              <MenuItem
                value="delete"
                color="fg.error"
                _hover={{ bg: "bg.error", color: "fg.error" }}
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                <MdDeleteOutline size={"20px"} />
              </MenuItem>
            )}
          </MenuContent>
        </MenuRoot>
        {/* Menu ends */}
      </Flex>
    </Flex>
  );
}
