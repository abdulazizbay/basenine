import { ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enum";
import { Product } from "./product";

export interface OrderItem {
  _id: ObjectId;
  itemQuantity: number;
  itemPrice: number;
  orderId: ObjectId;
  productId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: ObjectId;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  memberId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // From Aggregation
  orderItems: OrderItem[];
  productData: Product[]
}

export interface OrderitemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: ObjectId;
  orderId?: ObjectId;
}

export interface OrderInquiry{
  page: number;
  limit: number;
  orderStatus: OrderStatus;
}

export interface OrderUpdateInput{
  orderId: string;
  orderStatus: OrderStatus
}
export interface Orders {
  list: Order[];
  metaCounter: { total: number }[];
}