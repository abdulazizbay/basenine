import { ProductCollection, ProductOrder, ProductStatus } from "../enums/product.enum";
import { ObjectId } from "mongoose";
import { Team } from "./team";
import { Direction } from "./common";

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  teamId?: ObjectId | Team;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productDesc: string;
  productImages: string[];
  productViews: string[];
  createdAt: Date;
  updatedAt: Date;
}



export interface ProductInput {
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  teamId?: ObjectId;
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

export interface ProductInquiry {
  order: ProductOrder;
  direction: Direction; 
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  teamId?: ObjectId;
  search?: string;
}

export interface Products {
  list: Product[];
  metaCounter: { total: number }[];
}

