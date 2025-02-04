import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    user: {
      // user who is subscribing
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    channel: {
      // channel to which the user is subscribed
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = model("Subscription", subscriptionSchema);
