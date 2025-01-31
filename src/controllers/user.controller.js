import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// method to generate access token and refresh token at once
const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

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
  // => user login steps
  // get user details from frontend
  // validation the user input (not empty..)
  // check if user exists (username, email)
  // check the password
  // access token and refresh token
  // check for user login
  // send token to frontend using secure cookies
  // send a response

  // 👉 getting data from frontend
  const { email, username, password } = req.body;

  // 👉 checking if there aren't any empty fields
  if (!(email || username)) {
    throw new ApiError(400, "Please provide email or username");
  }

  // 👉 checking if user exists
  const user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // 👉 checking the password
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // 👉  generate access and refresh token
  const { accessToken, refreshToken } = await generateTokens(user._id);

  // 👉 removing private field from data
  const userWithoutPrivateFields = await User.findById(user._id).select(
    "-password -refreshToken -watchHistory"
  );

  // 👉 securing the cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  // 👉  sending the final response to frontend
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userWithoutPrivateFields, accessToken, refreshToken },
        "User Login Successful"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
