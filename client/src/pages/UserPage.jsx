import { profilePosts } from "@/atoms/profilePageAtom.mjs";
import { toaster } from "@/components/ui/toaster";
import UserHeader from "@/Components/UserHeader";
import UserPost from "@/Components/UserPost";
import { Center, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";

const UserPage = () => {
  const userProfilePosts = useRecoilValue(profilePosts);
  const setUserProfilePosts = useSetRecoilState(profilePosts);
  const [loadingUser, setUserLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  //used to determine whether to render a thread or replies
  const [renderType, setRenderType] = useState("threads");
  const { username } = useParams();
  //getProfile function
  const getProfile = async () => {
    try {
      //loading users
      // console.log("username");
      // console.log(username);
      setUserLoading(true);
      const userRes = await fetch(`/api/user/userId/${username}`);
      const userData = await userRes.json();
      setUserLoading(false);
      if (!userData.success) {
        toaster.create({
          type: "error",
          description: userData.error,
        });
      } else {
        // console.log("User details");
        // console.log(userData.user);
        setUserProfilePosts((prevState) => ({
          ...prevState,
          profileUser: userData.user,
        }));
        // setUserDetails(userData.user);
        //loading posts
        const userId = userData.user._id;
        setLoadingPosts(true);
        const postsRes = await fetch(`/api/user/profile-posts/${userId}`);
        const postData = await postsRes.json();
        setLoadingPosts(false);
        if (!postData.success) {
          toaster.create({
            type: "error",
            description: postData.error,
          });
        } else {
          console.log("All Posts");
          console.log(postData.userPosts);
          let threads = [];
          let replies = [];
          postData.userPosts.forEach((post) => {
            if (
              !(post.postedBy === userData.user._id && post.isAReply) ||
              post.isARepost
            )
              threads.push(post);
            else replies.push(post);
          });
          console.log("Thread");
          console.log(threads);
          setUserProfilePosts((prevState) => ({
            ...prevState,
            userThread: threads,
          }));
          // setuserThread(threads);
          console.log("Replies");
          console.log(replies);
          setUserProfilePosts((prevState) => ({
            ...prevState,
            userReplies: replies,
          }));
          // setUserReplies(replies);
        }
      }
    } catch (error) {
      setUserLoading(false);
      setLoadingPosts(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  //fetch shit
  useEffect(() => {
    getProfile();
  }, [username]);
  // console.log("RenderType is ", renderType);
  console.log(
    "The userProfile Post atom value - In the UserPage right now typeshit!"
  );
  console.log(userProfilePosts);
  // If the user details are loading
  if (loadingUser)
    return (
      <Center>
        {" "}
        <Spinner />
      </Center>
    );
  //done loading userDetails but no such user was found
  else if (!loadingUser && !userProfilePosts.profileUser)
    return <Center>User Not Found !</Center>;
  //done loadin the user and the user actually exists
  else {
    //if we are loading the posts
    if (loadingPosts) {
      return (
        <>
          <UserHeader
            user={userProfilePosts.profileUser}
            setRenderType={setRenderType}
            renderType={renderType}
          />
          <Center>
            <Spinner />
          </Center>
        </>
      );
    }
    //done loading the posts now we have the posts and we either rendering threads or replies
    else {
      //For the case of threads
      if (renderType === "threads") {
        //No threads found for the user
        if (userProfilePosts.userThread.length === 0)
          return (
            <>
              <UserHeader
                user={userProfilePosts.profileUser}
                setRenderType={setRenderType}
                renderType={renderType}
              />
              <Center>
                No Threads for {userProfilePosts.profileUser.username}
              </Center>
            </>
          );
        //threads found
        else {
          return (
            <>
              <UserHeader
                user={userProfilePosts.profileUser}
                setRenderType={setRenderType}
                renderType={renderType}
              />
              {userProfilePosts.userThread.map((post) => {
                return (
                  <UserPost
                    avatar={userProfilePosts.profileUser.profilePicture}
                    username={userProfilePosts.profileUser.username}
                    key={`${post._id}-${post?.isARepost}`}
                    likes={post.likesCount}
                    replies={post.repliesCount}
                    reposts={post.repostsCount}
                    postImg={post.image}
                    postTitle={post.caption}
                    postId={post._id}
                    isLiked={post.isLiked}
                    isReplied={post.isReplied}
                    isReposted={post.isReposted}
                    isARepost={post.isARepost}
                    time={post.isARepost ? post.repostedAt : post.createdAt}
                    interactionLikes={post.interactionLikes}
                    postUser={post.userDetails}
                  />
                );
              })}
            </>
          );
        }
      }
      // If we are rendering replies
      else {
        // If no replies found
        if (userProfilePosts.userReplies.length === 0)
          return (
            <>
              <UserHeader
                user={userProfilePosts.profileUser}
                setRenderType={setRenderType}
                renderType={renderType}
              />
              <Center>
                No Replies for {userProfilePosts.profileUser.username}
              </Center>
            </>
          );
        // if replies found
        else {
          return (
            <>
              <UserHeader
                user={userProfilePosts.profileUser}
                setRenderType={setRenderType}
                renderType={renderType}
              />
              {/* <Text> pos to render replies here !</Text> */}
              {userProfilePosts.userReplies.map((post) => {
                return (
                  <UserPost
                    avatar={userProfilePosts.profileUser.profilePicture}
                    username={userProfilePosts.profileUser.username}
                    key={`${post._id}-${post?.isARepost}`}
                    likes={post.likesCount}
                    replies={post.repliesCount}
                    reposts={post.repostsCount}
                    postImg={post.image}
                    postTitle={post.caption}
                    postId={post._id}
                    isLiked={post.isLiked}
                    isReplied={post.isReplied}
                    isReposted={post.isReposted}
                    time={post.createdAt}
                    interactionLikes={post.interactionLikes}
                    postUser={post.userDetails}
                  />
                );
              })}
            </>
          );
        }
      }
    }
  }
};

export default UserPage;
