import { shapeIntoMongooseObjectId } from "../libs/config";
import { Address } from "../libs/enums/common.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ObjectId } from "mongoose";
import {
  Team,
  TeamInput,
  TeamInquiry,
  TeamOrder,
  Teams,
  TeamUpdateInput,
} from "../libs/types/team";
import TeamModel from "../schema/Team.model";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";

class TeamService {
  private readonly teamModel;
  public viewService;
  constructor() {
    this.teamModel = TeamModel;
    this.viewService = new ViewService();
  }
  
  // SPA
  // filter  createdAt, subsicber, viewed,
  // also inlclude all teams qta
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

  public async getTeam(memberId: ObjectId | null, id: string): Promise<Team> {
    console.log(memberId);
    
    const teamId = shapeIntoMongooseObjectId(id);
    let result = await this.teamModel
      .findOne({
        _id: teamId,
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      // check existance
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: teamId,
        viewGroup: ViewGroup.TEAM,
      };
      const existView = await this.viewService.checkViewExistence(input);
      if (!existView) {
        // insert view
        await this.viewService.insertMemberView(input);
        // Increase Counts
        result = await this.teamModel
          .findByIdAndUpdate(
            teamId,
            { $inc: { teamViews: +1 } },
            { new: true },
          )
          .exec();
      }
    }
    return result;
  }

  // SSR
  public async createNewTeam(input: TeamInput): Promise<Team> {
    try {
      return await this.teamModel.create(input);
    } catch (err) {
      console.log("Error, model: createNewTeam:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  public async getAllTeams(): Promise<Team[]> {
    const result = await this.teamModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateChosenTeam(
    id: any,
    input: TeamUpdateInput,
  ): Promise<Team> {
    console.log("UPDATE ID:", id);
    console.log("UPDATE INPUT:", input);
    id = shapeIntoMongooseObjectId(id);
    const result = await this.teamModel
      .findByIdAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}
export default TeamService;
