import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { OrdinaryInquiry, PaginatedResult, T } from "../libs/types/common";
import { ObjectId } from "mongoose";
import {
  Team,
  TeamInput,
  TeamInquiry,
  Teams,
  TeamUpdateInput,
} from "../libs/types/team";
import TeamModel from "../schema/Team.model";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import { FavouriteGroup } from "../libs/enums/favourites.enum";
import FavouriteService from "./Favourite.service";

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

  public async getTeamOptions(): Promise<Pick<Team, "_id" | "teamNick">[]> {
    return await this.teamModel
      .find({})
      .select("teamNick")
      .sort({ teamNick: 1 })
      .lean<Pick<Team, "_id" | "teamNick">[]>()
      .exec();
  }

  public async getTeam(memberId: ObjectId | null, id: string): Promise<Team> {
    const teamId = shapeIntoMongooseObjectId(id);
    const memberObjectId = memberId
      ? shapeIntoMongooseObjectId(memberId)
      : null;
    const result = await this.teamModel
      .aggregate([
        { $match: { _id: teamId } },
        {
          $lookup: {
            from: "favourites",
            let: { targetId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$favouriteRefId", "$$targetId"] },
                      { $eq: ["$favouriteGroup", FavouriteGroup.TEAM] },
                      { $eq: ["$memberId", memberObjectId] },
                    ],
                  },
                },
              },
            ],
            as: "meFavourite",
          },
        },
        {
          $addFields: {
            meFavourited: { $gt: [{ $size: "$meFavourite" }, 0] },
          },
        },
        { $project: { meFavourite: 0 } },
      ])
      .exec();

    if (!result.length)
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    let team: Team = result[0];

    if (memberId) {
      const input: ViewInput = {
        memberId,
        viewRefId: teamId,
        viewGroup: ViewGroup.TEAM,
      };
      const existView = await this.viewService.checkViewExistence(input);
      if (!existView) {
        await this.viewService.insertMemberView(input);
        const updated = await this.teamModel
          .findByIdAndUpdate(teamId, { $inc: { teamViews: 1 } }, { new: true })
          .exec();
        if (updated) team.teamViews = updated.teamViews;
      }
    }

    return team;
  }
  public async updateSubscriberCount(
    teamId: ObjectId,
    amount: number,
  ): Promise<Team> {
    const result = await this.teamModel
      .findByIdAndUpdate(
        teamId,
        { $inc: { teamSubscribers: amount } },
        { new: true },
      )
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }
  public async getVisitedTeams(
    memberId: ObjectId,
    inquiry: OrdinaryInquiry,
  ): Promise<PaginatedResult<T>> {
    const memberObjectId = memberId
      ? shapeIntoMongooseObjectId(memberId)
      : null;
    const result = await this.viewService.getVisited(
      memberObjectId,
      inquiry,
      ViewGroup.TEAM,
    );

    const favouriteService = new FavouriteService(); 
    const favouritedIds = await favouriteService.getTeamFavourites(
      memberObjectId,
      FavouriteGroup.TEAM,
    );

    result.list = result.list.map((team) => ({
      ...team,
      meFavourited: favouritedIds.has(team._id.toString()),
    }));

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
