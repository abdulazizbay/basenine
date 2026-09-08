export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = `:method :url  :response-time [:status] \n`;
import mongoose from "mongoose";
import { ViewGroup } from "./enums/view.enum";
export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};
export const tableByGroup: Record<ViewGroup, string> = {
  [ViewGroup.PLAYER]: "players",
  [ViewGroup.PRODUCT]: "products",
  [ViewGroup.TEAM]: "teams",
};
