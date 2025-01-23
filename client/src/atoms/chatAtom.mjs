import { atom } from "recoil";

export const conversations = atom({
  key: "conversations",
  default: null,
});
export const selectedConversation = atom({
  key: "selectedChat",
  default: null,
});
export const conversationMessages = atom({
  key: "conversationMessages",
  default: null,
});
export const searchedConversations = atom({
  key: "searchedConversations",
  default: null,
});
export const unseenMessagesAtom = atom({
  key: "unseenMessagesCount",
  default: [],
});
