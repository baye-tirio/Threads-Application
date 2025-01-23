import { homePosts } from "@/atoms/homePageAtom.mjs";
import SuggestedUsersComponent from "@/Components/SuggestedUsersComponent";
import { toaster } from "@/components/ui/toaster";
import UserPost from "@/Components/UserPost";
import { Box, Center, Flex, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

export default function HomePage() {
  // const authUser = useRecoilValue(authenticatedUser);
  const [feed, setFeed] = useRecoilState(homePosts);
  //fetch the feed
  const [loadingFeed, setLoadingFeed] = useState(true);
  const getFeed = async () => {
    try {
      console.log("Trying to get the feed");
      setLoadingFeed(true);
      const res = await fetch("/api/user/feed");
      const data = await res.json();
      setLoadingFeed(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        console.log("Response from the server is : ");
        console.log(data);
        // trying to set the feed
        console.log("Trying to set the feed");
        setFeed((prevState) => data.feed);
      }
    } catch (error) {
      // setLoadingFeed(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  useEffect(() => {
    getFeed();
  }, []);
  console.log("feed atom value");
  console.log(feed);
  if (loadingFeed)
    return (
      <>
        <Center margin={4}>
          <Spinner s={"xl"} />
        </Center>
      </>
    );
  else if (feed.length === 0)
    return (
      <Flex gap={10} justifyContent={"space-between"}>
        <Box flex={80}>
          <Center>
            {" "}
            <h1>Follow some people to get a feed!</h1>
          </Center>
        </Box>
        <Box
          flex={20}
          display={{
            base: "none",
            md: "block",
          }}
        >
          <SuggestedUsersComponent />
        </Box>
      </Flex>
    );
  else
    return (
      <Flex gap={10} justifyContent={"space-between"}>
        <Box flex={80}>
          {feed.map((post) => {
            return (
              <UserPost
                key={`${post._id}-${post.isARepost}`}
                likes={post.likesCount}
                replies={post.repliesCount}
                reposts={post.repostsCount}
                postImg={post.image}
                postTitle={post.caption}
                avatar={post.userDetails.profilePicture}
                postId={post._id}
                username={post.userDetails.username}
                isLiked={post.isLiked}
                isReplied={post.isReplied}
                isReposted={post.isReposted}
                isARepost={post.isARepost}
                time={post.createdAt}
                interactionLikes={post.interactionLikes}
              />
            );
          })}
        </Box>
        <Box
          flex={20}
          display={{
            base: "none",
            md: "block",
          }}
        >
          <SuggestedUsersComponent />
        </Box>
      </Flex>
    );
}
