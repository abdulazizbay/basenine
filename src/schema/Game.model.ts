import mongoose, { Schema } from "mongoose";
import { Address } from "../libs/enums/common.enum";
import { GameStatus } from "../libs/enums/game.enum";

const GameSchema = new Schema(
  {
    teamAId: { type: Schema.Types.ObjectId, required: true, ref: "Team" },
    teamBId: { type: Schema.Types.ObjectId, required: true, ref: "Team" },

    gameDate: {
      type: Date,
      required: true,
    },
    gameAddress: {
      type: String,
      enum: Address,
    },
    gameStatus: {
      type: String,
      enum: GameStatus,
      default: GameStatus.UPCOMING,
    },
    teamAScore: {
      type: Number,
      default: null,
      min: 0,
    },
    teamBScore: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Game", GameSchema);
