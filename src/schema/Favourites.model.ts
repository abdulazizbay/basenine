import mongoose, { Schema } from "mongoose";
import { FavouriteGroup } from "../libs/enums/favourites.enum";

const FavouritesSchema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, required: true, ref: "Member" },

    favouriteGroup: {
      type: String,
      enum: FavouriteGroup,
      required: true
    },
    favouriteRefId:{
        type: Schema.Types.ObjectId,
        required: true
    },
  },
  { timestamps: true },
);

export default mongoose.model("Favourites", FavouritesSchema);
