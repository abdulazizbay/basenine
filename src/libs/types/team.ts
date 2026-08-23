import { ObjectId } from "mongoose";
import { Address } from "../enums/common.enum";
import { Direction } from "./common";
import { TeamOrder } from "../enums/team.enum";
export interface Team {
  _id?: ObjectId;
  teamNick: string;
  teamImage: string[];
  teamAddress: Address;
  teamSubscribers: number;
  teamViews: number;
  meFavourited?: boolean;
  createdAt: Date;
  updatedAt: Date;
  // team-status
}
export interface Teams {
  list: Team[];
  metaCounter: { total: number }[];
}

export interface TeamInput {
  teamNick: string;
  teamImage: string[];
  teamAddress: Address;
}
export interface TeamUpdateInput {
  _id?: ObjectId;
  teamNick?: string;
  teamImage?: string[];
  teamAddress?: Address;
  teamSubscribers?: number;
  teamViews?: number;
}

export interface TeamInquiry {
  order: TeamOrder;
  direction: Direction;
  page: number;
  limit: number;
  search?: string;
}


