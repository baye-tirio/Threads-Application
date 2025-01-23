import authScreen from "@/atoms/authPageAtom.mjs";
import authenticatedUser from "@/atoms/userAtom.mjs";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import {
  Flex,
  Box,
  Input,
  HStack,
  Stack,
  Button,
  Heading,
  Text,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useSetRecoilState } from "recoil";

export default function SignupCard() {
  const setAuthScreenState = useSetRecoilState(authScreen);
  const setUser = useSetRecoilState(authenticatedUser);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    try {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    } catch (error) {
      console.log(error);
    }
  };
  const handleSubmit = async () => {
    try {
      //validation
      setLoading(true);
      const res = await fetch("/api/authentication/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        setLoading(false);
        console.log(data);
        toaster.create({
          description: data.error,
          duration: 2000,
          type: "error",
        });
      } else {
        setLoading(false);
        console.log(data);
        toaster.create({
          description: "signup successfull!",
          duration: 2000,
          type: "success",
        });
        localStorage.setItem("threads-user", JSON.stringify(data));
        setUser(data.user);
        setFormData({
          name: "",
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Flex align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={4} px={6} gap={5}>
        <Stack align={"center"}>
          <Heading fontSize={"3xl"} textAlign={"center"}>
            Sign up
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "customDarkGray")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4} gap={4}>
            <HStack>
              <Box>
                <Field label="Full Name" required>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    variant="subtle"
                    onChange={handleChange}
                    value={formData.name}
                  />
                </Field>
              </Box>
              <Box>
                <Field label="Username" required>
                  <Input
                    type="text"
                    name="username"
                    placeholder="Username"
                    variant="subtle"
                    onChange={handleChange}
                    value={formData.username}
                  />
                </Field>
              </Box>
            </HStack>
            <Field label="Email" required>
              <Input
                type="email"
                name="email"
                placeholder="me@example.com"
                variant="subtle"
                onChange={handleChange}
                value={formData.email}
              />
            </Field>
            <Field label="password" required>
              <PasswordInput
                name="password"
                placeholder="password"
                variant="subtle"
                onChange={handleChange}
                value={formData.password}
              />
            </Field>
            <Stack spacing={10} pt={2}>
              <Button
                size="lg"
                bg={useColorModeValue("gray.600", "gray.700")}
                color={"white"}
                _hover={{
                  bg: useColorModeValue("gray.700", "gray.800"),
                }}
                onClick={handleSubmit}
              >
                {loading ? <Spinner /> : " Sign up"}
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Already a user?{" "}
                <Link
                  color={"blue.400"}
                  onClick={() => setAuthScreenState("login")}
                >
                  Login
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
