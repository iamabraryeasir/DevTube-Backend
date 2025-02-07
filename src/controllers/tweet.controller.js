import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
      content,
      owner: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet created successfully"));
  } catch (error) {
    throw new ApiError(400, error.message || "An error occurred");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.aggregate([
      {
        $match: {
          owner: userId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "User tweets retrieved successfully"));
  } catch (error) {
    throw new ApiError(400, error.message || "An error occurred");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { tweetId, content } = req.body;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(404, "Invalid tweet ID");
    }

    if (tweet.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to update this tweet");
    }

    if (!content) {
      throw new ApiError(400, "Content is required");
    }

    tweet.content = content;

    await tweet.save();

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
  } catch (error) {
    throw new ApiError(400, error.message || "An error occurred");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const tweetId = req.body.tweetId;

    if (!tweetId) {
      throw new ApiError(400, "Tweet ID is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(400, error.message || "An error occurred");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
