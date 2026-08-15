import { ProductCollection, ProductStatus } from "../enums/product.enum";
import { ObjectId } from "mongoose";
import { Team } from "./team";

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  teamId: ObjectId;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productDesc: string;
  productImages: string[];
  productViews: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  search?: string;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  teamId: ObjectId;
  productName: string;
  productPrice: number;
  productDesc: string;
  productLeftCount: number;
  productImages?: string[];
  productViews?: string[];
}
export interface ProductUpdateInput {
  _id: ObjectId;
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productVolume: number;
  productDesc?: string;
  productImages: string[];
  productViews: string[];
}
