import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { Spinner } from "@chakra-ui/react";
import React, { useState } from "react";

export default function FollowButton({ isFollowing, userId }) {
  const [followingLoading, setFollowingLoading] = useState(false);
  const [renderIsFollowing, setRenderIsFollowing] = useState(isFollowing);
  const handleFollowing = async () => {
    try {
      setFollowingLoading(true);
      const res = await fetch(`/api/user/follow-unfollow/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setFollowingLoading(false);
      console.log(res);
      const data = await res.json();
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        setRenderIsFollowing(!renderIsFollowing);
        toaster.create({
          type: "success",
          description: data.message ? data.message : "successfully followed",
        });
      }
    } catch (error) {
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };

  return (
    <Button size={"sm"} onClick={handleFollowing} disabled={followingLoading}>
      {followingLoading ? (
        <Spinner />
      ) : renderIsFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </Button>
  );
}
