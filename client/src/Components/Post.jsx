import { Box, Flex, Image, Spinner, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import Actions from "./Actions";
import { toaster } from "@/components/ui/toaster";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { profilePosts } from "@/atoms/profilePageAtom.mjs";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { repliedPost } from "@/atoms/postPageAtom.mjs";
import { homePosts } from "@/atoms/homePageAtom.mjs";

export default function Post({
  likes,
  replies,
  postTitle,
  postImg,
  postId,
  isLiked,
  isReposted,
  reposts,
}) {
  const setUserProfilePosts = useSetRecoilState(profilePosts);
  const setRepliedPost = useSetRecoilState(repliedPost);
  const userProfilePosts = useRecoilValue(profilePosts);
  const authUser = useRecoilValue(authenticatedUser);
  const [feed, setFeed] = useRecoilState(homePosts);
  const [likeLoading, setLikeLoading] = useState(false);
  const [repostLoading, setRepostLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const handleLike = async (e) => {
    e.preventDefault();
    console.log("handleLike called");
    try {
      //optimizing so that if the user clicks while we are processing a request to not be able to send another request to avoid unnecessary results
      if (likeLoading) return;
      setLikeLoading(true);
      const res = await fetch(`/api/post/like-unlike/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setLikeLoading(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        // now let's put some logic here to update the UI accordingly so that it reflects the server state!
        // if we is liking a post
        if (data.likedPost) {
          // update the profile posts atom
          setUserProfilePosts((prevState) => ({
            ...prevState,
            userThread: prevState.userThread?.map((thread) => {
              if (thread._id === data.likedPost) {
                return {
                  ...thread,
                  likesCount: thread.likesCount + 1,
                  isLiked: true,
                };
              } else return thread;
            }),
            userReplies: prevState.userReplies?.map((reply) => {
              if (reply._id === data.likedPost) {
                return {
                  ...reply,
                  likesCount: reply.likesCount + 1,
                  isLiked: true,
                };
              } else return reply;
            }),
          }));
          //update the repliedPost atom
          setRepliedPost((prevState) => ({
            ...prevState,
            post:
              prevState.post?._id === data.likedPost
                ? {
                    ...prevState.post,
                    likesCount: prevState.post.likesCount + 1,
                    isLiked: true,
                  }
                : prevState.post,
            replies: prevState.replies?.map((reply) => {
              if (reply._id === data.likedPost) {
                return {
                  ...reply,
                  likesCount: reply.likesCount + 1,
                  isLiked: true,
                };
              } else return reply;
            }),
          }));
          // **UPDATING THE FEED
          setFeed((prevState) =>
            prevState?.map((post) => {
              if (post._id === data.likedPost) {
                return {
                  ...post,
                  isLiked: true,
                  likesCount: post.likesCount + 1,
                };
              } else return post;
            })
          );
        }
        //WHEN WE UNLIKE
        else {
          //update the profilepage atom
          setUserProfilePosts((prevState) => ({
            ...prevState,
            userThread: prevState.userThread?.map((thread) => {
              if (thread._id === data.unlikedPost) {
                return {
                  ...thread,
                  likesCount: thread.likesCount - 1,
                  isLiked: false,
                };
              } else return thread;
            }),
            userReplies: prevState.userReplies?.map((reply) => {
              if (reply._id === data.unlikedPost) {
                return {
                  ...reply,
                  likesCount: reply.likesCount - 1,
                  isLiked: false,
                };
              } else return reply;
            }),
          }));
          //update the repliedPost atom
          setRepliedPost((prevState) => ({
            ...prevState,
            post:
              prevState.post?._id === data.unlikedPost
                ? {
                    ...prevState.post,
                    likesCount: prevState.post.likesCount - 1,
                    isLiked: false,
                  }
                : prevState.post,
            replies: prevState.replies?.map((reply) => {
              if (reply._id === data.unlikedPost) {
                return {
                  ...reply,
                  likesCount: reply.likesCount - 1,
                  isLiked: false,
                };
              } else return reply;
            }),
          }));
          // **UPDATING THE FEED
          setFeed((prevState) =>
            prevState?.map((post) => {
              if (post._id === data.unlikedPost) {
                return {
                  ...post,
                  isLiked: false,
                  likesCount: post.likesCount - 1,
                };
              } else return post;
            })
          );
        }
        console.log("The result received from the likeUnlike endpoint");
        console.log(data);
      }
    } catch (error) {
      setLikeLoading(false);
      console.log(error);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  const handleRepost = async (e) => {
    e.preventDefault();
    console.log("handleRepost called");
    try {
      //an optimization to avoid sending a reposting request while the current one is being processed
      if (repostLoading) return;
      const res = await fetch(`/api/post/repost-unrepost/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setRepostLoading(false);

      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        //if we reposting
        if (data.repost) {
          //# DEALING WITH THE PROFILE PAGE ATOM
          //situation where we are viewing our own profile
          if (authUser.username === userProfilePosts.profileUser?.username) {
            setUserProfilePosts((prevState) => ({
              ...prevState,
              userThread: [data.repost, ...prevState.userThread].map(
                (thread) => {
                  if (thread._id === data.repost._id) {
                    return {
                      ...thread,
                      isReposted: true,
                      repostsCount: thread.repostsCount + 1,
                    };
                  } else return thread;
                }
              ),
              userReplies: prevState.userReplies?.map((reply) => {
                if (reply._id === data.repost._id) {
                  return {
                    ...reply,
                    repostsCount: reply.repostsCount + 1,
                    isReposted: true,
                  };
                } else return reply;
              }),
            }));
          }
          // what if the profile is not ours
          else {
            setUserProfilePosts((prevState) => ({
              ...prevState,
              userThread: prevState.userThread?.map((thread) => {
                if (thread._id === data.repost._id) {
                  return {
                    ...thread,
                    isReposted: true,
                    repostsCount: thread.repostsCount + 1,
                  };
                } else return thread;
              }),
              userReplies: prevState.userReplies?.map((reply) => {
                if (reply._id === data.repost._id) {
                  return {
                    ...reply,
                    repostsCount: reply.repostsCount + 1,
                    isReposted: true,
                  };
                } else return reply;
              }),
            }));
          }

          //# NOW UPDATING THE POSTPAGE ATOM
          setRepliedPost((prevState) => ({
            ...prevState,
            post:
              prevState.post?._id === data.repost._id
                ? {
                    ...prevState.post,
                    repostsCount: prevState.post.repostsCount + 1,
                    isReposted: true,
                  }
                : prevState.post,
            replies: prevState.replies?.map((reply) => {
              if (reply._id === data.repost._id) {
                return {
                  ...reply,
                  repostsCount: reply.repostsCount + 1,
                  isReposted: true,
                };
              } else return reply;
            }),
          }));
          // **UPDATING THE FEED
          setFeed((prevState) =>
            prevState?.map((post) => {
              if (post._id === data.repost._id) {
                return {
                  ...post,
                  isReposted: true,
                  repostsCount: post.repostsCount + 1,
                };
              } else return post;
            })
          );
        }
        //if we are unreposting
        else {
          // What if we are unreposting from our own profile
          if (authUser.username === userProfilePosts.profileUser?.username) {
            setUserProfilePosts((prevState) => ({
              ...prevState,
              userThread: prevState.userThread
                ?.filter(
                  (post) =>
                    post._id !== data.unRepostedPostId || !post.isARepost
                )
                .map((thread) => {
                  if (thread._id === data.unRepostedPostId) {
                    return {
                      ...thread,
                      repostsCount: thread.repostsCount - 1,
                      isReposted: false,
                    };
                  } else return thread;
                }),
              userReplies: prevState.userReplies?.map((reply) => {
                if (reply._id === data.unRepostedPostId) {
                  return {
                    ...reply,
                    repostsCount: reply.repostsCount - 1,
                    isReposted: false,
                  };
                } else return reply;
              }),
            }));
          }
          // what if we are unreposting from someone else's profile
          else {
            setUserProfilePosts((prevState) => ({
              ...prevState,
              userThread: prevState.userThread?.map((thread) => {
                if (thread._id === data.unRepostedPostId) {
                  return {
                    ...thread,
                    repostsCount: thread.repostsCount - 1,
                    isReposted: false,
                  };
                } else return thread;
              }),
              userReplies: prevState.userReplies?.map((reply) => {
                if (reply._id === data.unRepostedPostId) {
                  return {
                    ...reply,
                    repostsCount: reply.repostsCount - 1,
                    isReposted: false,
                  };
                } else return reply;
              }),
            }));
          }
          // # DEALING WITH THE POST PAGE ATOM
          setRepliedPost((prevState) => ({
            ...prevState,
            post:
              prevState.post?._id === data.unRepostedPostId
                ? {
                    ...prevState.post,
                    repostsCount: prevState.post.repostsCount - 1,
                    isReposted: false,
                  }
                : prevState.post,
            replies: prevState.replies?.map((reply) => {
              if (reply._id === data.unRepostedPostId) {
                return {
                  ...reply,
                  repostsCount: reply.repostsCount - 1,
                  isReposted: false,
                };
              } else return reply;
            }),
          }));
          // **UPDATING THE FEED
          setFeed((prevState) =>
            prevState?.map((post) => {
              if (post._id === data.unRepostedPostId) {
                return {
                  ...post,
                  isReposted: false,
                  repostsCount: post.repostsCount - 1,
                };
              } else return post;
            })
          );
        }
        console.log("The response from the repostUnrepost endpoint");
        console.log(data);
      }
    } catch (error) {
      setRepostLoading(false);
      console.log("The error from the repost handler is:");
      console.log(error);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };

  return (
    <Flex flex={1} flexDirection={"column"} gap={2}>
      <Text fontSize="sm">{postTitle}</Text>
      {/* I could use border color with the parameter below */}
      {postImg && (
        <Box
          alignSelf={"center"}
          borderRadius={6}
          overflow={"hidden"}
          border={"1px solid {customLightGray}"}
        >
          {imageLoading && <Spinner />}
          <Image
            src={postImg}
            w={{
              base: "full",
              sm: "350px",
            }}
            onLoad={() => setImageLoading(false)}
          />
        </Box>
      )}
      {/* user actions (icons) section  */}
      <Flex gap={3} my={0}>
        <Actions
          liked={isLiked}
          handleLike={handleLike}
          reposted={isReposted}
          handleRepost={handleRepost}
          postId={postId}
        />
      </Flex>
      <Flex gap={2} alignItems={"center"} py={1}>
        <Text color={"customLightGray"} fontSize={"sm"}>
          {" "}
          {replies} replies
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"customLightGray"}></Box>
        <Text color={"customLightGray"} fontSize={"sm"}>
          {" "}
          {likes} likes
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"customLightGray"}></Box>
        <Text color={"customLightGray"} fontSize={"sm"}>
          {" "}
          {reposts} reposts
        </Text>
      </Flex>
    </Flex>
  );
}
