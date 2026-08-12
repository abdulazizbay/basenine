import mongoose, { Schema } from "mongoose";
import { PlayerPosition } from "../libs/enums/player.enum";

const playerSchema = new Schema(
  {
    playerNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    playerImages: {
      type: [String],
      default: [],
    },
    playerPosition: {
      type: String,
      enum: PlayerPosition,
    },
    playerNumber: {
      type: Number,
      required: true,
    },
    playerDateOfBirth: {
      type: Date,
      required: true,
    },
    playerHeight: {
      type: Number,
      required: false,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Team",
      default: null,
    },

    playerViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Player", playerSchema);
