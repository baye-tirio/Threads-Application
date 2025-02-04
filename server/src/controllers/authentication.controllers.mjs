import { User } from "../models/user.model.mjs";
import { errorHandler } from "../utils/errorHandler.mjs";
import bcryptjs from "bcryptjs";
import { setAuthToken } from "../utils/jwtAuthentication.mjs";

export const signUp = async (req, res, next) => {
  try {
    console.log("Signing up right now!");
    const { name, username, email, password } = req.body;
    //validate the credentials - express-validator
    //check if a user with the given credentials already exists
    const userExistsAlready = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (userExistsAlready) {
      next(errorHandler(409, "user already exists!"));
    } else {
      const newUser = new User({
        username,
        email,
        name,
        password: bcryptjs.hashSync(password, 10),
      });
      await newUser.save();
      // sign token
      req.user = newUser;
      setAuthToken(req, res, next);
      res.status(200).json({
        success: true,
        user: { ...newUser._doc, password: null },
      });
    }
  } catch (error) {
    next(error);
  }
};
export const logIn = async (req, res, next) => {
  console.log("loging in right now!");
  try {
    const { username, email, password } = req.body;
    //validate the credentials
    let user;
    if (username) user = await User.findOne({ username });
    else user = await User.findOne({ email });
    if (!user) next(errorHandler(401, "Invalid Credentials"));
    else {
      if (bcryptjs.compareSync(password, user.password)) {
        //sign the token
        req.user = user;
        setAuthToken(req, res, next);
        //unfreeze the account in case it was frozen
        user.frozen = false;
        await user.save();
        res.status(200).json({
          success: true,
          user: { ...user._doc, password: null },
        });
      } else next(errorHandler(401, "Invalid Credentials"));
    }
  } catch (error) {
    next(error);
  }
};
export const logOut = (_, res, next) => {
  try {
    res.clearCookie("auth_token");
    res.status(200).json({
      success: true,
      message: "successfully cleared the cookie",
    });
  } catch (error) {
    next(error);
  }
};
export const checkAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) next(errorHandler(404, "User Not Found!"));
    else {
      res.status(200).json({
        success: true,
        user: { ...user._doc, password: null },
      });
    }
  } catch (error) {
    next(error);
  }
};
