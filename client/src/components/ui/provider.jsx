"use client";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";
import customConfig from "../../theme";
export function Provider(props) {
  // const customConfig = defineConfig({
  //   theme: {
  //     tokens: {
  //       colors: {
  //         red: { value: "#EE0F0F" },
  //         gray: {
  //           light: {
  //             value: "#616161",
  //           },
  //           dark: {
  //             value: "#1E1E1E",
  //           },
  //         },
  //       },
  //     },
  //     semanticTokens: {
  //       colors: {
  //         danger: { value: "{colors.red}" },
  //         customLightGray: { value: "{colors.gray.light}" },
  //         customDarkGray: { value: "{colors.gray.dark}" },
  //       },
  //     },
  //   },
  // });
  const system = createSystem(defaultConfig, customConfig);
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
