import { ObjectId } from "mongoose";
import { Team } from "./team";
import { Address } from "../enums/common.enum";
import { GameStatus } from "../enums/game.enum";
export interface Game {
  _id: ObjectId;
  teamAId: ObjectId | Team;
  teamBId: ObjectId | Team;
  gameDate: Date;
  gameAddress: Address;
  gameStatus: GameStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameInput {
  teamAId: ObjectId;
  teamBId: ObjectId;
  gameDate: Date;
  gameAddress: Address;
}
export interface GameInputUpdate {
  _id: ObjectId;
  gameStatus: GameStatus;
}
