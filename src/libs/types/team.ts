import { ObjectId } from "mongoose";
import { Address } from "../enums/common.enum";
export interface Team{
    _id: ObjectId
    teamNick: string;
    teamImage: string[];
    teamAddress: Address;
    teamSubscribers: number;
    teamViews: Number
    createdAt: Date;
    updatedAt: Date
}