import Post from "@/Components/Post";
import PostHeader from "@/Components/PostHeader";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { Box, Center, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PostDetailsContext } from "@/Contexts/postDetails.context.mjs";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { repliedPost } from "@/atoms/postPageAtom.mjs";

const PostPage = () => {
  const post = useRecoilValue(repliedPost).post;
  const setPost = useSetRecoilState(repliedPost);
  const replies = useRecoilValue(repliedPost).replies;
  const setReplies = useSetRecoilState(repliedPost);
  const { postId } = useParams();
  const [postLoading, setPostLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const getReplies = async () => {
    try {
      // console.log("In the get replies function trying to get them replies!");
      // console.log("postId", postId);
      setRepliesLoading(true);
      const res = await fetch(`/api/post/replies/${postId}`);
      const data = await res.json();
      setRepliesLoading(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        console.log(data.replies);
        //Set them replies to the atom
        setReplies((prevState) => ({
          ...prevState,
          replies: data.replies,
        }));
      }
    } catch (error) {
      setRepliesLoading(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  const getPost = async () => {
    try {
      console.log("In the get post function trying to get them posts!");
      console.log("postId", postId);
      setPostLoading(true);
      const res = await fetch(`/api/post/${postId}`);
      const data = await res.json();
      setPostLoading(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        console.log("post");
        console.log(data.post);
        // setPost(data.post);
        // setting the post atom
        setPost((prevState) => ({
          ...prevState,
          postId: data.post._id,
          post: data.post,
        }));
        //getReplies after successfully fetching the post details
        getReplies();
      }
    } catch (error) {
      setPostLoading(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  useEffect(() => {
    getPost();
  }, []);
  console.log("Replied post atom in the post page ");
  console.log(useRecoilValue(repliedPost));
  if (postLoading)
    return (
      <Center>
        {" "}
        <Spinner />{" "}
      </Center>
    );
  else if (repliesLoading)
    return (
      <Box divideY={"2px"} divideColor={"customLightGray"}>
        {/* This is the section for rendering the post */}
        <Flex direction={"column"} gap={2} my={2}>
          <Flex gap={3} alignItems={"center"}>
            <Avatar
              size="md"
              name=" Mark Zuckerberg"
              src={post.userDetails.profilePicture}
            />
            <PostHeader
              username={post.userDetails.username}
              time={post.createdAt}
              postId={post._id}
            />
          </Flex>
          <PostDetailsContext.Provider
            value={{
              avatar: post.userDetails.profilePicture,
              postTitle: post.caption,
              username: post.userDetails.username,
              time: post.createdAt,
            }}
          >
            <Post
              likes={post.likesCount}
              replies={post.repliesCount}
              reposts={post.repostsCount}
              postImg={post.image}
              postTitle={post.caption}
              postId={post._id}
              isLiked={post.isLiked}
              isReplied={post.isReplied}
              isReposted={post.isReposted}
            />
          </PostDetailsContext.Provider>
        </Flex>
        {/* This is the section for rendering the download our app part */}
        <Flex justifyContent={"space-between"} py={4}>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"2xl"}>👋</Text>
            <Text color={"customLightGray"}>
              Get the app to like, reply and post.
            </Text>
          </Flex>
          <Button variant={"subtle"}>Get</Button>
        </Flex>
        {/* This is the section for rendering the download our app part */}
        <Flex justifyContent={"space-between"} py={4}>
          <Center>
            <Spinner />
          </Center>
        </Flex>
      </Box>
    );
  else
    return (
      <Box divideY={"2px"} divideColor={"customLightGray"}>
        {/* This is the section for rendering the post */}
        <Flex direction={"column"} gap={2} my={2}>
          <Flex gap={3} alignItems={"center"}>
            <Avatar
              size="md"
              name=" Mark Zuckerberg"
              src={post.userDetails.profilePicture}
            />
            <PostHeader
              username={post.userDetails.username}
              time={post.createdAt}
              postId={post._id}
            />
          </Flex>
          <PostDetailsContext.Provider
            value={{
              avatar: post.userDetails.profilePicture,
              postTitle: post.caption,
              username: post.userDetails.username,
              time: post.createdAt,
            }}
          >
            <Post
              likes={post.likesCount}
              replies={post.repliesCount}
              reposts={post.repostsCount}
              postImg={post.image}
              postTitle={post.caption}
              postId={post._id}
              isLiked={post.isLiked}
              isReplied={post.isReplied}
              isReposted={post.isReposted}
            />
          </PostDetailsContext.Provider>
        </Flex>
        {/* This is the section for rendering the download our app part */}
        <Flex justifyContent={"space-between"} py={4}>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"2xl"}>👋</Text>
            <Text color={"customLightGray"}>
              Get the app to like, reply and post.
            </Text>
          </Flex>
          <Button variant={"subtle"}>Get</Button>
        </Flex>
        {/* This is the part for rendering the replies of the post */}
        <Flex
          gap={1}
          direction={"column"}
          py={4}
          divideY={"2px"}
          divideColor={"customLightGray"}
        >
          {replies.length === 0 ? (
            <Center>No replies</Center>
          ) : (
            replies.map((reply) => (
              <Box py={2}>
                <Flex gap={3} alignItems={"center"}>
                  <Avatar
                    size="md"
                    name="Profile Picture"
                    src={reply.userDetails.profilePicture}
                  />
                  <PostHeader
                    username={reply.userDetails.username}
                    time={reply.createdAt}
                    postId={reply._id}
                  />
                </Flex>
                <PostDetailsContext.Provider
                  value={{
                    avatar: reply.userDetails.profilePicture,
                    postTitle: reply.caption,
                    username: reply.userDetails.username,
                    time: reply.createdAt,
                  }}
                >
                  <Post
                    key={reply._id}
                    likes={reply.likesCount}
                    replies={reply.repliesCount}
                    reposts={reply.repostsCount}
                    postImg={reply.image}
                    postTitle={reply.caption}
                    postId={reply._id}
                    isLiked={reply.isLiked}
                    isReplied={reply.isReplied}
                    isReposted={reply.isReposted}
                  />
                </PostDetailsContext.Provider>
              </Box>
            ))
          )}
        </Flex>
      </Box>
    );
};

export default PostPage;
