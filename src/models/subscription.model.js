import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    user: {
      // user who is subscribing
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    channel: {
      // channel to which the user is subscribed
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = model("Subscription", subscriptionSchema);
