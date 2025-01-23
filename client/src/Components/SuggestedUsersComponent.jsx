import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import SuggestedUser from "./SuggestedUser";
import {
  Skeleton,
  SkeletonCircle,
} from "@/components/ui/skeleton";
import { toaster } from "@/components/ui/toaster";

const SuggestedUsersComponent = () => {
  const [suggestedusers, setSuggetstedUsers] = useState(null);
  const [loadingSuggestedUsers, setLoadingSuggestedUsers] = useState(true);
  const getSuggestedUsers = async () => {
    try {
      setLoadingSuggestedUsers(true);
      const res = await fetch(`/api/user/suggested-users`);
      const data = await res.json();
      setLoadingSuggestedUsers(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        setSuggetstedUsers(data.users);
      }
    } catch (error) {
      setLoadingSuggestedUsers(false);
      console.log("Error in the getting suggested users useEffect");
      console.log(error);
    }
  };
  useEffect(() => {
    getSuggestedUsers();
  }, []);
  return (
    <Box>
      <Text mb={4} fontWeight={"bold"}>
        Suggested Users
      </Text>
      <Flex direction={"column"} gap={4}>
        {loadingSuggestedUsers
          ? [...Array(3)].map((_, idx) => (
              <Flex
                key={idx}
                gap={2}
                alignItems={"center"}
                p={"1"}
                borderRadius={"md"}
              >
                {/* avatar skeleton */}
                <Box>
                  <SkeletonCircle size={"10"} />
                </Box>
                {/* username and fullname skeleton */}
                <Flex w={"full"} flexDirection={"column"} gap={2}>
                  <Skeleton h={"8px"} w={"80px"} />
                  <Skeleton h={"8px"} w={"90px"} />
                </Flex>
                {/* follow button skeleton */}
                <Flex>
                  <Skeleton h={"20px"} w={"60px"} />
                </Flex>
              </Flex>
            ))
          : suggestedusers.map((user) => {
              return <SuggestedUser user={user} key={user._id} />;
            })}
      </Flex>
    </Box>
  );
};

export default SuggestedUsersComponent;
