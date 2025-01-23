import { Conversation } from "../models/conversation.model.mjs";
import { Message } from "../models/message.model.mjs";
import { User } from "../models/user.model.mjs";
import { errorHandler } from "../utils/errorHandler.mjs";
import { getClientId, io } from "../socket/socket.mjs";

export const createMessage = async (req, res, next) => {
  try {
    //the reciever is a username
    const { text, receiver } = req.body;
    const { _id: receiverId } = await User.findOne({ username: receiver });
    //get the conversation ID or create a conversation
    let conversaton = await Conversation.findOne({
      participants: {
        $all: [req.userId, receiverId],
      },
    });
    if (!conversaton) {
      //create a new conversation
      conversaton = new Conversation({
        participants: [req.userId, receiverId],
      });
      await conversaton.save();
    }
    //Now that we have the conversation created we can create a message
    const newMessage = new Message({
      conversationId: conversaton._id,
      sender: req.userId,
      text,
    });
    //save the message and update the conversation with the latest message
    await Promise.all([
      await newMessage.save(),
      await conversaton.updateOne(
        {
          lastMessage: {
            senderId: newMessage.sender,
            text: newMessage.text,
          },
        },
        { new: true }
      ),
    ]);
    //emit an event
    //get client id
    const client = getClientId(receiver);
    // new message event
    io.to(client).emit("newMessageEvent", newMessage);
    // incomming message event
    io.to(client).emit("incommingMessageEvent", newMessage);
    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteConversation = async (req, res, next) => {
  try {
  } catch (error) {}
};
export const deleteMessage = async (req, res, next) => {
  try {
  } catch (error) {}
};
export const editMessage = async (req, res, next) => {
  try {
  } catch (error) {}
};
export const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Message.find({
      conversationId,
    }).sort({ createdAt: 1 });
    // if (conversation.length === 0)
    //   next(errorHandler(404, "Conversation Not Found!"));
    res.status(200).json({
      success: true,
      messages: conversation,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllConversations = async (req, res, next) => {
  try {
    const AllConversations = await Conversation.find({
      participants: req.userId,
    })
      .populate({
        path: "participants",
        select: "username profilePicture",
      })
      .sort({
        "lastMessage.createdAt": -1,
      });
    // AllConversations = await Promise.all(
    //   AllConversations.map(async (convo) => {
    //     const receiverId = convo.participants.find(
    //       (participant) => participant.toString() !== req.userId.toString()
    //     );
    //     console.log("The id of the requester", req.userId);
    //     console.log("The id of the receiver", receiverId);
    //     const { username, profilePicture } = await User.findById(receiverId);
    //     return {
    //       ...convo._doc,
    //       username,
    //       profilePicture,
    //     };
    //   })
    // );
    res.status(200).json({
      success: true,
      conversations: AllConversations,
    });
  } catch (error) {
    next(error);
  }
};
export const getSearchedConversations = async (req, res, next) => {
  try {
    const { searchTerm } = req.query;
    const regEx = new RegExp(searchTerm, "i");
    console.log("The regular expression is ");
    console.log(regEx);
    const { username } = await User.findById(req.userId);
    //
    const existingConversations = await Conversation.find({
      participants: req.userId,
    }).populate({
      path: "participants",
      select: "username profilePicture",
      match: {
        username: {
          $ne: username,
        },
      },
    });
    // console.log("existing conversations");
    // console.log(existingConversations);
    //filtered conversation
    const filteredExistingConversations = existingConversations.filter(
      (convo) => regEx.test(convo.participants[0].username)
    );
    // console.log(
    //   "filtered existing conversations - recepient matches the searchTerm"
    // );
    // console.log(filteredExistingConversations);
    //Already filtered usernames
    const filteredUsernames = filteredExistingConversations.map(
      (convo) => convo.participants[0].username
    );
    // console.log("filtered existing convos usernames");
    // console.log(filteredUsernames);
    // Get all other usernames that aren't yet filtered
    const otherMatchedUsers = await User.find({
      $and: [
        {
          username: {
            $regex: regEx,
          },
        },
        {
          username: {
            $nin: filteredUsernames,
          },
        },
        {
          username: {
            $ne: username,
          },
        },
      ],
    })
      .select("username")
      .select("profilePicture");
    // console.log("Other matched users");
    // console.log(otherMatchedUsers);
    const reconstructedMatchedUsers = otherMatchedUsers.map((user) => {
      return {
        _id: `new_chat-${user._id}`,
        participants: [user],
        lastMessage: undefined,
      };
    });
    res.status(200).json({
      success: true,
      matchedConversations: [
        ...filteredExistingConversations,
        ...reconstructedMatchedUsers,
      ],
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
