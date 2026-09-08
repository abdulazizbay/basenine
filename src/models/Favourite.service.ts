import { shapeIntoMongooseObjectId } from "../libs/config";
import { FavouriteGroup } from "../libs/enums/favourites.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Favourite,
  FavouriteInput,
  TeamSubscribers,
} from "../libs/types/favourite";
import { Member } from "../libs/types/member";
import FavouritesModel from "../schema/Favourites.model";
import { ObjectId } from "mongoose";
import TeamService from "./Team.service";
import { OrdinaryInquiry } from "../libs/types/common";
class FavouriteService {
  private readonly favouriteModel;
  private readonly teamService;
  constructor() {
    this.favouriteModel = FavouritesModel;
    this.teamService = new TeamService();
  }
  public async getFavourites(
    member: Member,
    group?: FavouriteGroup,
  ): Promise<Favourite[]> {
    try {
      const match: any = { memberId: shapeIntoMongooseObjectId(member._id) };
      if (group) match.favouriteGroup = group;

      const result = await this.favouriteModel
        .aggregate([
          { $match: match },
          {
            $lookup: {
              from: "teams",
              let: { refId: "$favouriteRefId", grp: "$favouriteGroup" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$refId"] },
                        { $eq: ["$$grp", "TEAM"] },
                      ],
                    },
                  },
                },
              ],
              as: "team",
            },
          },
          {
            $lookup: {
              from: "players",
              let: { refId: "$favouriteRefId", grp: "$favouriteGroup" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$_id", "$$refId"] },
                        { $eq: ["$$grp", "PLAYER"] },
                      ],
                    },
                  },
                },
              ],
              as: "player",
            },
          },
        ])
        .exec();

      return result;
    } catch (err) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
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
