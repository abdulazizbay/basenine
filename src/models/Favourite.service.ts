import { shapeIntoMongooseObjectId } from "../libs/config";
import { FavouriteGroup } from "../libs/enums/favourites.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Favourite,
  FavouriteInput,
  TeamSubscribers,
} from "../libs/types/favourite";
import FavouritesModel from "../schema/Favourites.model";
import { ObjectId } from "mongoose";
import TeamService from "./Team.service";
import { OrdinaryInquiry, PaginatedResult, T } from "../libs/types/common";
class FavouriteService {
  private readonly favouriteModel;
  private readonly teamService;
  constructor() {
    this.favouriteModel = FavouritesModel;
    this.teamService = new TeamService();
  }
  

  public async getTeamSubscribers(
    teamId: string,
    page: number,
    limit: number,
  ): Promise<TeamSubscribers> {
    const id = shapeIntoMongooseObjectId(teamId);
    const match = { favouriteRefId: id, favouriteGroup: FavouriteGroup.TEAM };

    const [list, total] = await Promise.all([
      this.favouriteModel
        .find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("memberId", "memberNick memberImage")
        .exec(),
      this.favouriteModel.countDocuments(match).exec(),
    ]);

    return {
      list: list.map((fav) => ({
        _id: fav.memberId._id,
        memberNick: fav.memberId.memberNick,
        memberImage: fav.memberId.memberImage,
        createdAt: fav.createdAt,
      })),
      metaCounter: [{ total }],
    };
  }

  public async getFavouriteTeams(
    memberId: ObjectId,
    inquiry: OrdinaryInquiry,
  ): Promise<PaginatedResult<T>> {
    try {
      const { page, limit } = inquiry;
      const memberObjectId = shapeIntoMongooseObjectId(memberId);
      const match: T = {
        memberId: memberObjectId,
        favouriteGroup: FavouriteGroup.TEAM,
      };

      const data = await this.favouriteModel
        .aggregate([
          { $match: match },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "teams",
              localField: "favouriteRefId",
              foreignField: "_id",
              as: "favouriteTeam",
            },
          },
          { $unwind: "$favouriteTeam" },
          {
            $facet: {
              list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
              metaCounter: [{ $count: "total" }],
            },
          },
        ])
        .exec();

      const result: PaginatedResult<T> = {
        list: [],
        metaCounter: data[0].metaCounter,
      };
      result.list = data[0].list.map((ele: T) => ele.favouriteTeam);
      return result;
    } catch (err) {
      console.log("ERROR, model: getFavouriteTeams: ", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
    }
  }

  public async checkFavouriteExistence(
    input: FavouriteInput,
  ): Promise<Favourite | null> {
    return await this.favouriteModel
      .findOne({
        memberId: input.memberId,
        favouriteGroup: input.favouriteGroup,
        favouriteRefId: input.favouriteRefId,
      })
      .exec();
  }

  public async addFavourite(input: FavouriteInput): Promise<Favourite> {
    const existing = await this.checkFavouriteExistence(input);
    if (existing)
      throw new Errors(HttpCode.BAD_REQUEST, Message.ALREADY_EXECUTED); // already subscribed

    try {
      const result = await this.favouriteModel.create(input);

      if (input.favouriteGroup === FavouriteGroup.TEAM) {
        await this.teamService.updateSubscriberCount(input.favouriteRefId, 1);
      }

      return result;
    } catch (err) {
      console.log("Error, model: addFavourite:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async deleteFavourite(input: FavouriteInput): Promise<void> {
    const deleted = await this.favouriteModel
      .findOneAndDelete({
        memberId: input.memberId,
        favouriteGroup: input.favouriteGroup,
        favouriteRefId: input.favouriteRefId,
      })
      .exec();

    if (!deleted) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (input.favouriteGroup === FavouriteGroup.TEAM) {
      await this.teamService.updateSubscriberCount(input.favouriteRefId, -1);
    }
  }
  public async getTeamFavourites(
    memberId: ObjectId,
    favouriteGroup: FavouriteGroup,
  ): Promise<Set<string>> {
    const data = await this.favouriteModel.find({memberId, favouriteGroup})
    return new Set(
        data.map((ele: Favourite) => ele.favouriteRefId.toString()),
    );
  }
}

  

export default FavouriteService;
