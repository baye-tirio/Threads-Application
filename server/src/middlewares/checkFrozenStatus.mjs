import { User } from "../models/user.model.mjs";
import { errorHandler } from "../utils/errorHandler.mjs";

export const checkFrozenStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (user.frozen)
      next(errorHandler(403, "Cannot operate from a frozen account !"));
    else next();
  } catch (error) {
    next(error);
  }
};
