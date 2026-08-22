import { shapeIntoMongooseObjectId } from "../libs/config";
import { ViewGroup } from "../libs/enums/view.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import {
  Player,
  PlayerInput,
  PlayerInquiry,
  Players,
} from "../libs/types/player";
import { Team, TeamInput, TeamUpdateInput } from "../libs/types/team";
import { ViewInput } from "../libs/types/view";
import PlayerModel from "../schema/Player.model";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";

class PlayerService {
  private readonly playerModel;
  public viewService;
  constructor() {
    this.playerModel = PlayerModel;
    this.viewService = new ViewService();
  }

  // SPA
  // filter  createdAt, subsicber, viewed,
  // also inlclude all players qta
  public async getPlayers(inquiry: PlayerInquiry): Promise<Players> {
    const match: T = {};

    if (inquiry.search) {
      match.playerNick = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T = { [inquiry.order]: inquiry.direction };

    const result = await this.playerModel
      .aggregate([
        { $match: match },
        {
          $facet: {
            list: [
              { $sort: sort },
              { $skip: (inquiry.page - 1) * inquiry.limit },
              { $limit: inquiry.limit },
              {
                $lookup: {
                  from: "teams",
                  localField: "teamId",
                  foreignField: "_id",
                  as: "teamId",
                },
              },
              {
                $unwind: {
                  path: "$teamId",
                  preserveNullAndEmptyArrays: true,
                },
              },
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

  public async getPlayer(
    memberId: ObjectId | null,
    id: string,
  ): Promise<Player> {
    const playerId = shapeIntoMongooseObjectId(id);
    let result = await this.playerModel
      .findOne({
        _id: playerId,
      })
      .populate("teamId")
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      // check existance
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: playerId,
        viewGroup: ViewGroup.PLAYER,
      };
      const existView = await this.viewService.checkViewExistence(input);
      if (!existView) {
        // insert view
        await this.viewService.insertMemberView(input);
        // Increase Counts
        result = await this.playerModel
          .findByIdAndUpdate(
            playerId,
            { $inc: { playerViews: +1 } },
            { new: true },
          )
          .populate("teamId")
          .exec();
      }
    }
    return result;
  }

  // SSR
  public async createNewPlayer(input: PlayerInput): Promise<Player> {
    try {
      return await this.playerModel.create(input);
    } catch (err) {
      console.log("Error, model: createNewPlayer:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  public async getAllPlayers(): Promise<Player[]> {
    const result = await this.playerModel
      .find()
      .populate("teamId")
      .lean<Player[]>()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }
}
export default PlayerService;
