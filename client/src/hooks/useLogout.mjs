import { toaster } from "@/components/ui/toaster";

export const useLogout = async () => {
  try {
    const res = await fetch("/api/authentication/logout");
    const data = await res.json();
    if (!data.success) {
      toaster.create({
        description: data.error,
        type: "error",
        duration: 2000,
      });
    } else {
      toaster.create({
        description: data.message,
        type: "success",
      });
    }
  } catch (error) {
    toaster.create({
      description: error.message,
      type: "error",
    });
  }
};
