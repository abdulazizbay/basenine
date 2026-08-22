import { ObjectId } from "mongoose";
import { FavouriteGroup } from "../enums/favourites.enum";
export interface Favourite {
  _id: ObjectId;
  memberId: ObjectId;
  favouriteGroup: FavouriteGroup;
  favouriteRefId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
