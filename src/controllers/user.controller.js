import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // => user registration steps
  // get user details from frontend
  // validation the user input (not empty..)
  // check if user already exists (username, email)
  // check for images, check for avatar
  // upload them to cloudinary (check avatar)
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  // 👉 getting data from
  const { username, email, fullName, password } = req.body;
  // console.table([username, email, fullName, password]);

  // 👉 checking if there aren't any empty fields
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 👉 checking if username or email already exists in the db
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with username or email already existed");
  }

  // 👉 checking if the user has properly uploaded the avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError("Avatar file is required");
  }

  // 👉 upload both the images on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError("Avatar file is required");
  }

  // 👉 creating user object
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  // 👉 checking if the user is successfully created
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -watchHistory"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // 👉 sending the final response to frontend
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "login user",
  });
});

export { registerUser, loginUser };
