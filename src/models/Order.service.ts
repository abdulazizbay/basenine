import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member, MemberInput } from "../libs/types/member";
import {
  Order,
  OrderInquiry,
  OrderItem,
  OrderitemInput,
  Orders,
  OrderUpdateInput,
} from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import { ObjectId } from "mongoose";
import MemberService from "./Member.service";
import { OrderStatus } from "../libs/enums/order.enum";
import ProductService from "./Product.service";
import { T } from "../libs/types/common";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;
  private readonly productService;
  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
    this.productService = new ProductService();
  }
  public async createOrder(
    member: Member,
    input: OrderitemInput[],
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const amount = input.reduce((accumulator: number, item: OrderitemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      });
      const orderId = newOrder._id;
      await this.recordOrderItem(orderId, input);
      await this.productService.deductStock(input);
      return newOrder;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderitemInput[],
  ): Promise<void> {
    const promisedList = input.map(async (item: OrderitemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "INSERTED";
    });
    await Promise.all(promisedList);
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry,
  ): Promise<Orders> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const match: T = { memberId };
    if (inquiry.orderStatus) match.orderStatus = inquiry.orderStatus;

    const result = await this.orderModel
      .aggregate([
        { $match: match },
        {
          $facet: {
            list: [
              { $sort: { updatedAt: -1 } },
              { $skip: (inquiry.page - 1) * inquiry.limit },
              { $limit: inquiry.limit },
              {
                $lookup: {
                  from: "orderItems",
                  localField: "_id",
                  foreignField: "orderId",
                  as: "orderItems",
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "orderItems.productId",
                  foreignField: "_id",
                  as: "productData",
                },
              },
            ],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();

    return result[0];
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput,
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const orderId = shapeIntoMongooseObjectId(input.orderId);

    const result = await this.orderModel
      .findOneAndUpdate(
        { _id: orderId, memberId: memberId }, 
        { orderStatus: input.orderStatus },
        { new: true },
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}

export default OrderService;
