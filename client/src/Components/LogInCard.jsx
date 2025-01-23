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
    identifier: "",
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
    //data validation first
    //after validation
    try {
      setLoading(true);
      const res = await fetch("/api/authentication/log-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: /@/.test(formData.identifier)
          ? JSON.stringify({
              email: formData.identifier,
              password: formData.password,
            })
          : JSON.stringify({
              username: formData.identifier,
              password: formData.password,
            }),
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
          description: "logged in!",
          duration: 2000,
          type: "success",
        });
        localStorage.setItem("threads-user", JSON.stringify(data));
        setUser(data.user);
        setFormData({
          identifier: "",
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
            Log In
          </Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "customDarkGray")}
          boxShadow={"lg"}
          p={8}
          w={{
            base: "full",
            sm: "400px",
          }}
        >
          <Stack spacing={4} gap={6}>
            <Field label="Username or Email" required>
              <Input
                name="identifier"
                placeholder="username or email"
                variant="subtle"
                onChange={handleChange}
                value={formData.identifier}
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
                {loading ? <Spinner /> : "Log In"}
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Don't have an account?{" "}
                <Link
                  color={"blue.400"}
                  onClick={() => setAuthScreenState("signup")}
                >
                  SignUp
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
