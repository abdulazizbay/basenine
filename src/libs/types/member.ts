import { Session } from "express-session";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { ObjectId } from "mongoose";
import { Request } from "express";
import { Address } from "../enums/common.enum";

export interface Member {
  _id: ObjectId;
  memberNick: string;
  memberPassword: string;
  memberType: MemberType;
  memberImage?: string;
  memberStatus: MemberStatus;
  memberPhone: string;
  memberAdress?: string;
  memberDesc?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface MemberInput {
  memberNick: string;
  memberPassword: string;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberImage?: string;
  memberPhone: string;
  memberAdress?: Address;
  memberDesc?: string;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

export interface MemberUpdateInput {
  _id: ObjectId;
  memberNick?: string;
  memberPhone?: string;
  memberPassword?: string;
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberDesc?: string;
  memberAdress?: string;
  memberImage?: string;
}

export interface ExtendedRequest extends Request {
  member: Member;
  file: Express.Multer.File;
  files: Express.Multer.File[];
}

export interface AdminRequest extends Request {
  member: Member;
  session: Session & { member: Member };
  file: Express.Multer.File;
  files: Express.Multer.File[];
}
