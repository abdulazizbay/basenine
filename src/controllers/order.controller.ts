import { Response } from "express";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/member";
import Errors, { HttpCode } from "../libs/Errors";
import OrderService from "../models/Order.service";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";

const orderService = new OrderService();
const orderController: T = {};

// orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
//   try {
//     const result = await orderService.createOrder(req.member, req.body);
//     res.status(200).json(result);
//   } catch (err) {
//     if (err instanceof Errors) res.status(err.code).json(err);
//     else res.status(Errors.standard.code).json(Errors.standard.message);
//   }
// };

// orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
//   try {
//     const { page, limit, orderStatus } = req.query;
//     const inquiry: OrderInquiry = {
//       page: Number(page),
//       limit: Number(limit),
//       orderStatus: orderStatus as OrderStatus,
//     };

//     const result = await orderService.getMyOrders(req.member, inquiry);
//     res.status(HttpCode.OK).json(result);
//   } catch (err) {
//     if (err instanceof Errors) res.status(err.code).json(err);
//     else res.status(Errors.standard.code).json(Errors.standard.message);
//   }
// };

// orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
//   try {
//     const input: OrderUpdateInput = req.body;
//     const result = await orderService.updateOrder(req.member, input)
//     res.status(HttpCode.OK).json(result)
//   } catch (err) {
//     if (err instanceof Errors) res.status(err.code).json(err);
//     else res.status(Errors.standard.code).json(Errors.standard.message);
//   }
// };

export default orderController;
