import { Button } from "@/components/ui/button";
import { IoMdClose } from "react-icons/io";
import {
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useContext, useState } from "react";
import { Field } from "@/components/ui/field";
import {
  Flex,
  Text,
  Textarea,
  Image as ChakraImage,
  useDialog,
  DialogRootProvider,
  Box,
} from "@chakra-ui/react";
import { Image } from "lucide-react";
import { CloseButton } from "@/components/ui/close-button";
import { toaster } from "@/components/ui/toaster";
import CommentSvg from "./CommentSvg";
import { PostDetailsContext } from "@/Contexts/postDetails.context.mjs";
import PostHeader from "./PostHeader";
import { Link } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { Avatar } from "@/components/ui/avatar";
import { repliedPost } from "@/atoms/postPageAtom.mjs";
import { profilePosts } from "@/atoms/profilePageAtom.mjs";

const MAX_CHARACTERS = 500;

export default function CreateReply({ postId }) {
  const currentRepliedPost = useRecoilValue(repliedPost);
  const setRepliedPost = useSetRecoilState(repliedPost);
  const userProfilePosts = useRecoilValue(profilePosts);
  const setUserProfilePosts = useSetRecoilState(profilePosts);
  const authUser = useRecoilValue(authenticatedUser);
  const postDetails = useContext(PostDetailsContext);
  const [replyLoading, setReplyLoading] = useState(false);
  const [reply, setReply] = useState({
    caption: "",
    image: "",
  });

  const handleChange = (e) => {
    try {
      if (e.target.name === "image") {
        const file = e.target.files[0];
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          setReply({ ...reply, image: fileReader.result });
        };
        fileReader.readAsDataURL(file);
      } else {
        if (e.target.value.length > MAX_CHARACTERS)
          setReply({
            ...reply,
            caption: e.target.value.slice(0, MAX_CHARACTERS),
          });
        else setReply({ ...reply, caption: e.target.value });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReply = async () => {
    try {
      setReplyLoading(true);
      const res = await fetch(`/api/post/reply/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reply),
      });
      const data = await res.json();
      setReplyLoading(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        console.log("The reply details are (from the backend)");
        console.log(data.reply);
        setReply({
          caption: "",
          image: "",
        });
        setOpen(false);
        toaster.create({
          type: "success",
          description: "Reply posted!",
        });
        //update the repliedPost atom if we are replying to the post on screen on the postPage so that we see the reply on screen
        if (currentRepliedPost.postId === data.reply.parentPost) {
          console.log(
            "Tryna update the atom typeshit because a new reply has been posted!"
          );
          setRepliedPost((prevState) => ({
            ...prevState,
            post: data.repliedPost,
            replies: [
              { ...data.reply, userDetails: authUser },
              ...prevState.replies,
            ],
          }));
        }
        //if the profile rendered is of the authenticated user
        if (authUser.username === userProfilePosts.profileUser?.username) {
          setUserProfilePosts((prevState) => ({
            ...prevState,
            userReplies: [data.reply, ...prevState.userReplies],
          }));
        }
      }
    } catch (error) {
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  const dialog = useDialog();
  const [open, setOpen] = useState(false);
  return (
    <>
      <DialogRoot
        placement={"center"}
        lazyMount
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DialogBackdrop />
        <DialogTrigger>
          <CommentSvg
            onClick={() => {
              dialog.setOpen();
            }}
          />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          <DialogBody>
            {/* Unyama flani ivi kama wa twitter */}
            <Flex gap={3}>
              {/* The left part */}
              <Flex flexDirection={"column"} alignItems={"center"}>
                <Link to={`/${postDetails.username}`}>
                  {" "}
                  <Avatar
                    size="md"
                    name={`${postDetails.username}`}
                    src={postDetails.avatar}
                  />{" "}
                </Link>
                {/* The line thing for the replies */}

                <Box w="1px" h={"100px"} bg="gray" my={2}></Box>
              </Flex>
              {/* The right part */}
              <Box w={"full"} p={2}>
                <PostHeader
                  username={postDetails.username}
                  time={postDetails.time}
                />
                <Text size={"sm"}> {postDetails.postTitle} </Text>
              </Box>
            </Flex>
            {/* mwisho wa unyama flani ivi kama wa twitter */}
            <Flex alignItems={"center"} gap={2}>
              {/* The avatars for the likes  */}

              <Avatar
                size="md"
                name={authUser.username}
                src={authUser.profilePicture}
              />

              <Text
                size={"sm"}
                my={4}
              >{`replying to @${postDetails.username}`}</Text>
            </Flex>

            <Field
              invalid={reply.caption.trim().length === MAX_CHARACTERS}
              errorText={"Max characters reached"}
            >
              <Textarea
                value={reply.caption}
                name="caption"
                placeholder="Write your reply..."
                variant="outline"
                onChange={(e) => handleChange(e)}
              />
              {reply.image && (
                <Flex position={"relative"} alignSelf={"center"}>
                  <ChakraImage src={reply.image} />
                  <CloseButton
                    size={"xs"}
                    bg={"gray.800"}
                    borderRadius={"full"}
                    position={"absolute"}
                    top={2}
                    right={2}
                    onClick={() => setReply({ ...reply, image: undefined })}
                  >
                    <IoMdClose />
                  </CloseButton>
                </Flex>
              )}
              <Flex w={"full"} justifyContent={"space-between"} p={"1"}>
                <label>
                  <Image cursor={"pointer"} />
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleChange(e)}
                    hidden
                  />
                </label>
                <Text
                  fontSize={"xs"}
                  color={"gray.800"}
                  fontWeight={"bold"}
                  textAlign={"right"}
                >
                  {`${MAX_CHARACTERS - reply.caption.trim().length}/${MAX_CHARACTERS}`}
                </Text>
              </Flex>
            </Field>
          </DialogBody>
          <DialogFooter>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Button
                onClick={handleReply}
                disabled={replyLoading}
                loading={replyLoading}
                loadingText={"Replying..."}
              >
                Reply
              </Button>

              <DialogActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
            </Flex>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
}
