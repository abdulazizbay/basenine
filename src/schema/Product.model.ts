import mongoose, { Schema } from "mongoose";
import {
  ProductCollection,
  ProductStatus,
} from "../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productImages: {
      type: [String],
      default: [],
    },
    productLeftCount: {
      type: Number,
      required: true,
    },
    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },
    teamId: { type: Schema.Types.ObjectId, required: false, ref: "Team" },
    productDesc: {
      type: String,
    },
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },
    productViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
