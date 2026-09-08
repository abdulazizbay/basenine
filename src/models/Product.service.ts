import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { OrdinaryInquiry, PaginatedResult, T } from "../libs/types/common";
import {
  Product,
  ProductInput,
  ProductInquiry,
  Products,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import TeamService from "./Team.service";
import { OrderitemInput } from "../libs/types/order";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /**  SPA */
  // initially pass to frontend the teams to choose from
  // filter by collection,
  // add search
  public async getProducts(inquiry: ProductInquiry): Promise<Products> {
    const match: T = { productStatus: ProductStatus.PROCESS };

    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;
    if (inquiry.teamId)
      match.teamId = shapeIntoMongooseObjectId(inquiry.teamId);
    if (inquiry.search)
      match.productName = { $regex: new RegExp(inquiry.search, "i") };

    const sort: T = { [inquiry.order]: inquiry.direction };

    const result = await this.productModel
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

  public async getProduct(
    memberId: ObjectId | null,
    id: string,
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .populate("teamId")
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      // check existance
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const existView = await this.viewService.checkViewExistence(input);
      if (!existView) {
        // insert view
        await this.viewService.insertMemberView(input);
        // Increase Counts
        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: +1 } },
            { new: true },
          )
          .populate("teamId")
          .exec();
      }
    }
    return result;
  }
  // used in order
  public async deductStock(input: OrderitemInput[]): Promise<void> {
    const promisedList = input.map(async (item: OrderitemInput) => {
      const productId = shapeIntoMongooseObjectId(item.productId);
      const result = await this.productModel
        .updateOne(
          { _id: productId, productLeftCount: { $gte: item.itemQuantity } },
          { $inc: { productLeftCount: -item.itemQuantity } },
        )
        .exec();
      if (result.matchedCount === 0) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG); // not enough stock
      }
    });
    await Promise.all(promisedList);
  }

  public async getVisitedProducts(
    memberId: ObjectId,
    inquiry: OrdinaryInquiry,
  ): Promise<PaginatedResult<T>> {
    const memberObjectId = memberId
      ? shapeIntoMongooseObjectId(memberId)
      : null;
    const result = await this.viewService.getVisited(
      memberObjectId,
      inquiry,
      ViewGroup.PRODUCT,
    );

    return result;
  }

  /**  SSR */

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel
      .find()
      .populate("teamId")
      .lean<Product[]>()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.log("Error, model: CreateNewProduct:", err);

      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: any,
    input: ProductUpdateInput,
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findByIdAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}
export default ProductService;
