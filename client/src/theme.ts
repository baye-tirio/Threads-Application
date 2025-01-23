import { createSystem, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        red: { value: "#EE0F0F" },
        gray: {
          light: {
            value: "#616161",
          },
          dark: {
            value: "#1E1E1E",
          },
        },
      },
    },
    semanticTokens: {
      colors: {
        danger: { value: "{colors.red}" },
        customLightGray: { value: "{colors.gray.light}" },
        customDarkGray: { value: "{colors.gray.dark}" },
      },
    },
  },
});
export default createSystem(customConfig);
