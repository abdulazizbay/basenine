import { tableByGroup } from "../libs/config";
import { ViewGroup } from "../libs/enums/view.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { OrdinaryInquiry, PaginatedResult, T } from "../libs/types/common";
import { Teams } from "../libs/types/team";
import { View, ViewInput } from "../libs/types/view";
import ViewModel from "../schema/View.model";
import { ObjectId } from "mongoose";
class ViewService {
  private readonly viewModel;
  constructor() {
    this.viewModel = ViewModel;
  }

  public async checkViewExistence(input: ViewInput): Promise<View> {
    return await this.viewModel
      .findOne({
        memberId: input.memberId,
        viewRefId: input.viewRefId,
        viewGroup: input.viewGroup,
      })
      .exec();
  }
  public async insertMemberView(input: ViewInput): Promise<View> {
    try {
      return await this.viewModel.create(input);
    } catch (err) {
      console.log("ERROR, model: insertMemberView: ", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async getVisited(
    memberId: ObjectId,
    inquiry: OrdinaryInquiry,
    viewGroup: ViewGroup,
  ): Promise<PaginatedResult<T>> {
    try {

      const from = tableByGroup[viewGroup];
      const { page, limit } = inquiry;
      const match: T = { viewGroup: viewGroup, memberId: memberId };
      const data = await ViewModel.aggregate([
        { $match: match },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: from,
            localField: "viewRefId",
            foreignField: "_id",
            as: "visited",
          },
        },
        { $unwind: "$visited" },
        {
          $facet: {
            list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
            metaCounter: [{ $count: "total" }],
          },
        },
      ]).exec();

      const result: PaginatedResult<T> = { list: [], metaCounter: data[0].metaCounter };
      result.list = data[0].list.map((ele: any) => ele.visited);
      return result;
    } catch (err) {
      console.log("ERROR, model: getVisited: ", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
    }
  }
}

export default ViewService;
