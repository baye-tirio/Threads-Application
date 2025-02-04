import { Button } from "@/components/ui/button";
import { useColorModeValue } from "@/components/ui/color-mode";
import { FaPlus } from "react-icons/fa6";
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
import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/field";
import {
  Flex,
  Text,
  Textarea,
  Image as ChakraImage,
  useDialog,
} from "@chakra-ui/react";
import { Image } from "lucide-react";
import { CloseButton } from "@/components/ui/close-button";
import { toaster } from "@/components/ui/toaster";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { profilePosts } from "@/atoms/profilePageAtom.mjs";
import authenticatedUser from "@/atoms/userAtom.mjs";

const MAX_CHARACTERS = 500;

export default function CreatePost() {
  const userProfilePosts = useRecoilValue(profilePosts);
  const setUserProfilePosts = useSetRecoilState(profilePosts);
  const authUser = useRecoilValue(authenticatedUser);
  const [postLoading, setPostLoading] = useState(false);
  const [post, setPost] = useState({
    caption: "",
    image: undefined,
  });
  const handleChange = (e) => {
    try {
      if (e.target.name === "image") {
        // console.log("Trying to read an image file");
        const file = e.target.files[0];
        console.log(file);
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          setPost({ ...post, image: fileReader.result });
        };
        fileReader.readAsDataURL(file);
      } else {
        if (e.target.value.length > MAX_CHARACTERS)
          setPost({
            ...post,
            caption: e.target.value.slice(0, MAX_CHARACTERS),
          });
        else setPost({ ...post, caption: e.target.value });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handlePost = async () => {
    try {
      setPostLoading(true);
      console.log("The post information about to submitted to the server : ");
      console.log(post);
      const res = await fetch("/api/post/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      });
      const data = await res.json();
      setPostLoading(false);
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        console.log(data);
        // if the userProfilePosts.profileUser is the same as the authenticated user then we update the atom
        if (authUser.username === userProfilePosts.profileUser?.username) {
          setOpen(false);
          setUserProfilePosts((prevState) => ({
            ...prevState,
            userThread: [data.post, ...prevState.userThread],
          }));
        }
        //clear the modal
        setPost({
          caption: "",
          image: "",
        });
        //close the reply modal either way
        setOpen(false);
        toaster.create({
          type: "success",
          description: "post created !",
        });
      }
    } catch (error) {
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  const [open, setOpen] = useState(false);
  //fix for the aria-hidden thing to properly disable focus in the background while the modal is shown
  useEffect(() => {
    const root = document.getElementById("root");
    if (open) {
      root?.setAttribute("inert", "true"); // Disable interactions
    } else {
      root?.removeAttribute("inert");
    }
  }, [open]);

  return (
    <>
      <DialogRoot
        placement={"center"}
        lazyMount
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
      >
        <DialogBackdrop />
        <DialogTrigger asChild>
          <Button
            position={"fixed"}
            bottom={10}
            right={10}
            bg={useColorModeValue("gray.500", "gray.700")}
            color={useColorModeValue("black", "white")}
          >
            <FaPlus />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle />
          </DialogHeader>
          <DialogBody>
            <Field
              invalid={post.caption.trim().length === MAX_CHARACTERS}
              errorText={"Max characters reached"}
            >
              <Textarea
                value={post.caption}
                name="caption"
                placeholder="Post goes here..."
                variant="outline"
                onChange={(e) => handleChange(e)}
              />
              {post.image && (
                <Flex position={"relative"} alignSelf={"center"}>
                  <ChakraImage src={post.image} />{" "}
                  <CloseButton
                    size={"xs"}
                    bg={"gray.800"}
                    borderRadius={"full"}
                    position={"absolute"}
                    top={2}
                    right={2}
                    onClick={() => setPost({ ...post, image: undefined })}
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
                  {" "}
                  {`${MAX_CHARACTERS - post.caption.trim().length}/${MAX_CHARACTERS}`}{" "}
                </Text>
              </Flex>
            </Field>
          </DialogBody>
          <DialogFooter>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Button
                onClick={handlePost}
                disabled={postLoading}
                loading={postLoading}
                loadingText={"posting..."}
              >
                Post
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
