import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Player, PlayerInput } from "../libs/types/player";
import { Team, TeamInput, TeamUpdateInput } from "../libs/types/team";
import PlayerModel from "../schema/Player.model";

class PlayerService {
  private readonly playerModel;

  constructor() {
    this.playerModel = PlayerModel;
  }
 
  // SPA
   // filter  createdAt, subsicber, viewed,
  // also inlclude all players qta
  public async getTeams(inquiry: TeamInquiry): Promise<Teams> {
    const match: T = {};

    if (inquiry.search) {
      match.teamNick = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T = { [inquiry.order]: inquiry.direction };

    const result = await this.teamModel
      .aggregate([
        { $match: match },
        {
          $facet: {
            list: [
              { $sort: sort },
              { $skip: (inquiry.page - 1) * inquiry.limit },
              { $limit: inquiry.limit },
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
