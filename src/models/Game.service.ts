import { shapeIntoMongooseObjectId } from "../libs/config";
import { GameStatus } from "../libs/enums/game.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Direction, T } from "../libs/types/common";
import {
  Game,
  GameInput,
  GameInputUpdate,
  GameInquiry,
  Games,
} from "../libs/types/game";
import { TeamStanding } from "../libs/types/team";
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

    const direction =
      inquiry.gameStatus === GameStatus.FINISHED
        ? Direction.DESC
        : Direction.ASC;

    const result = await this.gameModel
      .aggregate([
        { $match: match },
        {
          $facet: {
            list: [
              { $sort: { gameDate: direction } },
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

  public async getStandings(): Promise<TeamStanding[]> {
    const match = {
      gameStatus: GameStatus.FINISHED,
      teamAScore: { $gte: 0 },
      teamBScore: { $gte: 0 },
    };
    const result = await this.gameModel.aggregate([
      { $match: match },

      {
        $project: {
          teams: [
            {
              teamId: "$teamAId",
              scored: "$teamAScore",
              allowed: "$teamBScore",
            },
            {
              teamId: "$teamBId",
              scored: "$teamBScore",
              allowed: "$teamAScore",
            },
          ],
        },
      },
      { $unwind: "$teams" },
      // {
      //     teams: { teamId: A, scored: 5, allowed: 2 }
      // }
      // {
      //     teams: { teamId: A, scored: 5, allowed: 2 }
      // }
      {
        $group: {
          _id: "$teams.teamId",

          runsFor: {
            $sum: "$teams.scored",
          },

          runsAgainst: {
            $sum: "$teams.allowed",
          },

          games: {
            $sum: 1,
          },

          wins: {
            $sum: {
              $cond: [{ $gt: ["$teams.scored", "$teams.allowed"] }, 1, 0],
            },
          },

          losses: {
            $sum: {
              $cond: [{ $lt: ["$teams.scored", "$teams.allowed"] }, 1, 0],
            },
          },

          draws: {
            $sum: {
              $cond: [{ $eq: ["$teams.scored", "$teams.allowed"] }, 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          runDiff: { $subtract: ["$runsFor", "$runsAgainst"] },
          winPct: {
            $divide: ["$wins", "$games"],
          },
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "team",
        },
      },
      { $unwind: "$team" },
      { $sort: { winPct: -1, runDiff: -1 } },
    ]);
    if (!result.length) {
      return [];
    }
    const leader = result[0];

    return result.map((standing) => ({
      ...standing,
      gamesBehind:
        (leader.wins - standing.wins + (standing.losses - leader.losses)) / 2,
    }));
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
