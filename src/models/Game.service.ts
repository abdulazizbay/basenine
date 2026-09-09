import { shapeIntoMongooseObjectId } from "../libs/config";
import { GameStatus } from "../libs/enums/game.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import {
  Game,
  GameInput,
  GameInputUpdate,
  GameInquiry,
  Games,
} from "../libs/types/game";
import GameModel from "../schema/Game.model";

class GameService {
  private readonly gameModel;

  constructor() {
    this.gameModel = GameModel;
  }
  // SPA
  // filter  DateofGame, adress
  // also inlclude all players qta
  public async getGames(inquiry: GameInquiry): Promise<Games> {
    const match: T = {};

    if (inquiry.gameAddress) match.gameAddress = inquiry.gameAddress;
    if (inquiry.gameStatus) match.gameStatus = inquiry.gameStatus;
    if (inquiry.teamId) {
      inquiry.teamId = shapeIntoMongooseObjectId(inquiry.teamId);
      match.$or = [{ teamAId: inquiry.teamId }, { teamBId: inquiry.teamId }];
    }

    if (inquiry.startDate || inquiry.endDate) {
      match.gameDate = {};
      if (inquiry.startDate) match.gameDate.$gte = new Date(inquiry.startDate);
      if (inquiry.endDate) match.gameDate.$lte = new Date(inquiry.endDate);
    }

    const result = await this.gameModel
      .aggregate([
        { $match: match },
        {
          $addFields: {
            isLocal: inquiry.memberAddress
              ? {
                  $cond: [
                    { $eq: ["$gameAddress", inquiry.memberAddress] },
                    0,
                    1,
                  ],
                }
              : 0,
          },
        },
        {
          $facet: {
            list: [
              { $sort: { isLocal: 1, gameDate: 1 } },
              { $skip: (inquiry.page - 1) * inquiry.limit },
              { $limit: inquiry.limit },
              {
                $lookup: {
                  from: "teams",
                  localField: "teamAId",
                  foreignField: "_id",
                  as: "teamAId",
                },
              },
              { $unwind: "$teamAId" },
              {
                $lookup: {
                  from: "teams",
                  localField: "teamBId",
                  foreignField: "_id",
                  as: "teamBId",
                },
              },
              { $unwind: "$teamBId" },
              { $project: { isLocal: 0 } },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();

    if (!result.length)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result[0];
  }
  public async getGame(id: string): Promise<Game> {
    const gameId = shapeIntoMongooseObjectId(id);
    const result = await this.gameModel
      .findOne({ _id: gameId })
      .populate("teamAId")
      .populate("teamBId")
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  // SSR
  public async createNewGame(input: GameInput): Promise<Game> {
    try {
      return await this.gameModel.create(input);
    } catch (err) {
      console.log("Error, model: createNewGame:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  public async getAllGames(): Promise<Game[]> {
    const result = await this.gameModel
      .find()
      .populate("teamAId")
      .populate("teamBId")
      .lean<Game[]>()
      .sort({ gameDate: -1 })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }
  public async updateChosenGame(
    id: any,
    input: GameInputUpdate,
  ): Promise<Game> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.gameModel
      .findByIdAndUpdate({ _id: id }, input, {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}
export default GameService;
