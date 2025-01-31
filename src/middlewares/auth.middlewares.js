import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // getting the token from the frontend
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", ""); // getting the token from the header(mobile apps)

    // checking if the token exists
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // decoding the token
    const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // fetching the user
    const user = await User.findById(decodedTokenInfo?._id).select(
      "-password -refreshToken"
    );

    // checking if the user exists
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // storing the user in the request
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid access token");
  }
});

export { verifyJWT };
