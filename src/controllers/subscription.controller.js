import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  try {
    const channelId = new mongoose.Types.ObjectId(req.params.channelId);

    // get subscriberId from req.user
    const subscriberId = req.user._id;

    // check if channel exists
    const channel = await User.findById(channelId);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    // check if user is trying to subscribe to their own channel
    if (channelId.equals(subscriberId)) {
      throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    // check if user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({
      user: subscriberId,
      channel: channelId,
    });

    if (existingSubscription) {
      // if subscribed, then unsubscribe
      await Subscription.findByIdAndDelete(existingSubscription._id);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
    }

    // if not subscribed, then subscribe
    const subscription = await Subscription.create({
      user: subscriberId,
      channel: channelId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { subscription }, "Subscribed successfully"));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  try {
    const channelId = req.params.subscriberId;

    // check if channel exists
    const channel = await User.findById(channelId);

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    // get subscribers of the channel
    const subscribers = await Subscription.find({ channel: channelId })
      .populate("user", "name email")
      .exec(); // populate user field with name and email

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribers },
          "Subscribers fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // check if user exists
  const user = await User.findById(subscriberId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // get subscribed channels of the user
  const subscribedChannels = await Subscription.find({ user: subscriberId })
    .populate("channel", "name email")
    .exec(); // populate channel field with name and email

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannels },
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
