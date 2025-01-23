import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { Avatar } from "@/components/ui/avatar";

const SuggestedUser = ({ user }) => {
  const [updating, setUpdating] = useState(false);
  const [following, setFollowing] = useState(false);
  const handleFollow = async () => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/user/follow-unfollow/${user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setUpdating(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
        console.log(data.error);
      } else {
        //This might work or not depending on whether or not the component rerenders when the prop value changes
        if (/unfollowed/i.test(data?.message)) setFollowing(false);
        else setFollowing(true);
      }
    } catch (error) {
      console.log(error);
      setUpdating(false);
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  return (
    <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
      <Flex gap={2} as={Link} to={`/${user.username}`}>
        <Avatar src={user.profilePicture} />
        <Box>
          <Text fontSize={"sm"} fontWeight={"bold"}>
            {user.username}
          </Text>
          <Text color={"gray.light"} fontSize={"sm"}>
            {user.name}
          </Text>
        </Box>
      </Flex>
      <Button
        size={"sm"}
        color={following ? "black" : "white"}
        bg={following ? "white" : "blue.400"}
        onClick={handleFollow}
        disabled={updating}
        _hover={{
          color: following ? "black" : "white",
          opacity: ".8",
        }}
      >
        {updating ? <Spinner /> : following ? "Unfollow" : "Follow"}
      </Button>
    </Flex>
  );
};

export default SuggestedUser;
