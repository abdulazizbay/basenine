import { FavouriteGroup } from "../libs/enums/favourites.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Favourite } from "../libs/types/favourite";
import { Member } from "../libs/types/member";
import FavouritesModel from "../schema/Favourites.model";
class FavouriteService {
  private readonly favouriteModel;
  constructor() {
    this.favouriteModel = FavouritesModel;
  }
  public async getFavourites(
    member: Member,
    group?: FavouriteGroup,
  ): Promise<Favourite[]> {
    try {
      const match: any = { memberId: member._id };
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
  //   public async insertMemberView(input: ViewInput): Promise<View> {
  //     try {
  //       return await this.viewModel.create(input);
  //     } catch (err) {
  //       console.log("ERROR, model: insertMemberView: ", err);
  //       throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
  //     }
  //   }
}

export default FavouriteService;
