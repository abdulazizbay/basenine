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
  teamAScore: number | null;
  teamBScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface Games {
  list: Game[];
  metaCounter: { total: number }[];
}

export interface GameInput {
  teamAId: ObjectId;
  teamBId: ObjectId;
  gameDate: Date;
  gameAddress: Address;
}
export interface GameInputUpdate {
  gameStatus?: GameStatus;
  teamAScore?: number | null;
  teamBScore?: number | null;
}
export interface GameInquiry {
  page: number;
  limit: number;
  gameAddress?: Address;
  gameStatus?: GameStatus;
  startDate?: Date;
  endDate?: Date;
  teamId?: string;
}
