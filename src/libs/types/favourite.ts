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
export interface TeamSubscriber {
  _id: ObjectId;
  memberNick: string;
  memberImage: string;
  createdAt: Date; // when they subscribed
}

export interface TeamSubscribers {
  list: TeamSubscriber[];
  metaCounter: { total: number }[];
}

export interface FavouriteInput {
  memberId: ObjectId;
  favouriteGroup: FavouriteGroup;
  favouriteRefId: ObjectId;
}