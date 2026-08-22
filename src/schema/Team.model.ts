import mongoose, { Schema } from "mongoose";
import { Address } from "../libs/enums/common.enum";

const teamSchema = new Schema(
  {
    teamNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    teamImage: {
      type: [String],
      default: [],
    },
    teamAddress: {
      type: String,
      enum: Address,
    },
    teamSubscribers: {
      type: Number,
      default: 0,
    },
    teamViews: {
      type: Number,
      default: 0,
    },
    // team-status
  },
  { timestamps: true },
);

export default mongoose.model("Team", teamSchema);
