import {
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Center,
  Float,
  Circle,
} from "@chakra-ui/react";
import { CiCamera } from "react-icons/ci";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Field } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { useRecoilValue, useSetRecoilState } from "recoil";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { useNavigate } from "react-router-dom";
import useImagePreview from "@/hooks/useImagePreview.mjs";

export default function UserProfileEdit() {
  const navigate = useNavigate();
  const authUser = useRecoilValue(authenticatedUser);
  const setAuthUser = useSetRecoilState(authenticatedUser);
  const { handleImageChange, imageUrl } = useImagePreview();
  // console.log(authUser);
  const [formData, setFormData] = useState({
    name: undefined,
    username: undefined,
    email: undefined,
    profilePicture: undefined,
    bio: undefined,
    password: undefined,
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    try {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    } catch (error) {
      toaster.create({
        type: "error",
        description: error.message,
      });
    }
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log("The data we bout to send to the server typeshit!");
      console.log({ ...formData, profilePicture: imageUrl });
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          profilePicture: imageUrl ? imageUrl : undefined,
        }),
      });
      setLoading(false);
      const data = await res.json();
      if (!data.success) {
        toaster.create({
          type: "error",
          description: data.error,
        });
      } else {
        localStorage.setItem("threads-user", JSON.stringify(data));
        setAuthUser(data.user);
        toaster.create({
          type: "success",
          description: "successfully updated the user",
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
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack
        spacing={4}
        w={"full"}
        maxW={"md"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={6}
        my={12}
      >
        <Heading lineHeight={1.1} fontSize={{ base: "1xl", sm: "2xl" }}>
          {" "}
          <Center>Update Profile</Center>
        </Heading>
        <Field>
          <Stack
            // direction={["column", "row"]}
            spacing={6}
            width={"full"}
            alignItems={"center"}
          >
            <Center alignSelf={"center"}>
              <Avatar size="2xl" src={imageUrl || authUser.profilePicture}>
                {/* <AvatarBadge
                  as={IconButton}
                  size="sm"
                  rounded="full"
                  top="-10px"
                  colorScheme="red"
                  aria-label="remove Image"
                  icon={<SmallCloseIcon />}
                /> */}
                <label>
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e)}
                    hidden
                  />
                  <Float
                    placement="bottom-end"
                    offsetX="1"
                    offsetY="1"
                    cursor={"pointer"}
                  >
                    <Circle
                      bg={useColorModeValue("gray.500", "black")}
                      size="25px"
                      outlineColor="bg"
                    >
                      {/* <MdOutlineCancel /> */}
                      <CiCamera />
                    </Circle>
                  </Float>
                </label>
              </Avatar>
            </Center>
          </Stack>
        </Field>
        <Field label="Username" required>
          <Input
            name="username"
            placeholder="UserName"
            defaultValue={authUser.username}
            _placeholder={{ color: "gray.500" }}
            type="text"
            onChange={(e) => handleChange(e)}
          />
        </Field>
        <Field label="Full Name" required>
          <Input
            name="name"
            defaultValue={authUser.name}
            placeholder="Full Name"
            _placeholder={{ color: "gray.500" }}
            type="text"
            onChange={(e) => handleChange(e)}
          />
        </Field>
        <Field label="Bio">
          <Input
            defaultValue={authUser.bio}
            placeholder="Bio"
            name="bio"
            _placeholder={{ color: "gray.500" }}
            type="text"
            onChange={(e) => handleChange(e)}
          />
        </Field>
        <Field label="Email address" required>
          <Input
            defaultValue={authUser.email}
            placeholder="your-email@example.com"
            name="email"
            _placeholder={{ color: "gray.500" }}
            type="email"
            onChange={(e) => handleChange(e)}
          />
        </Field>
        <Field label="Password">
          <PasswordInput
            name="password"
            placeholder="password"
            _placeholder={{ color: "gray.500" }}
            onChange={(e) => handleChange(e)}
          />
        </Field>
        <Stack
          spacing={6}
          direction={["column", "row"]}
          justifyContent={"space-between"}
        >
          <Button
            disabled={loading}
            bg={"red.400"}
            color={"white"}
            width={"40%"}
            _hover={{
              bg: "red.500",
            }}
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            bg={"blue.400"}
            color={"white"}
            width={"40%"}
            _hover={{
              bg: "blue.500",
            }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
}
