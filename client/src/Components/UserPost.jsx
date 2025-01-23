import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import Post from "./Post";
import PostHeader from "./PostHeader";
import { PostDetailsContext } from "@/Contexts/postDetails.context.mjs";

export default function UserPost({
  likes,
  replies,
  reposts,
  postImg,
  postTitle,
  avatar,
  postId,
  username,
  isLiked,
  isReplied,
  isReposted,
  isARepost,
  time,
  interactionLikes,
  postUser,
}) {
  const postDetails = {
    avatar: isARepost ? postUser.profilePicture : avatar,
    postTitle,
    username: isARepost ? postUser.username : username,
    time,
  };
  return (
    // Link to={`/${username}/post/${postId}`}
    <Link to={`/${username}/post/${postId}`}>
      {isARepost && (
        <Text size={"xs"} color={"customLightGray"}>
          {" "}
          {username} reposted
        </Text>
      )}
      <Flex gap={3} marginBottom={4} py={5}>
        {/* The left part */}
        <Flex flexDirection={"column"} alignItems={"center"}>
          <Link to={`/${isARepost ? postUser.username : username}`}>
            {" "}
            <Avatar
              size="md"
              name={`${username}`}
              src={isARepost ? postUser.profilePicture : avatar}
            />{" "}
          </Link>
          {/* The line thing for the replies */}
          {interactionLikes.length !== 0 && (
            <Box w="1px" h={"full"} bg="gray" my={2}></Box>
          )}
          {/* The avatars for the likes  */}
          <Box w={"full"}>
            <AvatarGroup size="xs">
              {[...Array(3)].map((_, i) => {
                if (interactionLikes[i])
                  return (
                    <Avatar
                      key={i}
                      size="xs"
                      name={interactionLikes[i]?.username}
                      src={interactionLikes[i]?.profilePicture}
                    />
                  );
              })}
              {interactionLikes.length > 3 && (
                <Avatar
                  variant="solid"
                  fallback={`+${interactionLikes.length - 3}`}
                />
              )}
            </AvatarGroup>
          </Box>
        </Flex>
        {/* The right part */}
        <Box w={"full"} p={2}>
          <PostHeader
            username={isARepost ? postUser.username : username}
            time={time}
            postId={postId}
          />
          {/* Wrap this in a context provider  */}
          <PostDetailsContext.Provider value={postDetails}>
            <Post
              likes={likes}
              replies={replies}
              reposts={reposts}
              postImg={postImg}
              postTitle={postTitle}
              postId={postId}
              isLiked={isLiked}
              isReplied={isReplied}
              isReposted={isReposted}
            />
          </PostDetailsContext.Provider>
        </Box>
      </Flex>
    </Link>
  );
}
