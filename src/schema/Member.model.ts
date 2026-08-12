import mongoose, { Schema } from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import { Address } from "../libs/enums/common.enum";

const memberSchema = new Schema(
  {
    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    memberPassword: {
      type: String,
      select: false,
      required: true,
    },
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },
    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },
    memberImage: {
      type: String,
    },

    memberPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    memberAddress: {
      type: String,
      enum: Address,
    },
    memberDesc: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Member", memberSchema);
