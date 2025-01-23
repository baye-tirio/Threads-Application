import jwt from "jsonwebtoken";
export const setAuthToken = (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const token = jwt.sign({ userId }, process.env.AUTH_TOKEN, {
      expiresIn: "3d",
    });
    res.cookie("auth_token", token, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production" ? true : false,
    });
  } catch (error) {
    next(error);
  }
};
export const checkAuthToken = async (req, res, next) => {
  const token = req.cookies.auth_token;
  jwt.verify(token, process.env.AUTH_TOKEN, (error, payload) => {
    if (error) next(error);
    else {
      req.userId = payload.userId;
      next();
    }
  });
};
