import { PlayerPosition } from "../enums/player.enum";
import { ObjectId } from "mongoose";
import { Team } from "./team";
import { Direction } from "./common";
export interface Player {
  playerNick: string;
  playerImages: string[];
  playerPosition: PlayerPosition;
  playerNumber: number;
  playerDateOfBirth: Date;
  playerHeight: number;
  teamId: ObjectId | Team;
  playerViews: number;
  createdAt: Date;
  updatedAt: Date;
  //status
}
export interface Players {
  list: Player[];
  metaCounter: { total: number }[];
}

export interface PlayerInput {
  playerNick: string;
  playerImages: string[];
  playerPosition: PlayerPosition;
  playerNumber: number;
  playerDateOfBirth: Date;
  playerHeight?: number;
  teamId?: ObjectId;
  //status
}
export interface PlayerInquiry {
  order: PlayerOrder;
  direction: Direction;
  page: number;
  limit: number;
  search?: string;
}

export enum PlayerOrder {
  CREATED_AT = "createdAt",
  VIEWS = "playerViews",
}


