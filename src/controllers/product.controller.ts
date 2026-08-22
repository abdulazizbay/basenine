import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Request, Response } from "express";
import ProductService from "../models/Product.service";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { ProductCollection } from "../libs/enums/product.enum";
import TeamService from "../models/Team.service";

const productService = new ProductService();
const teamService = new TeamService();

const productController: T = {};

// /**  SPA */
// productController.getProducts = async (req: Request, res: Response) => {
//   try {
//     const { page, limit, order, productCollection, search } = req.query;
//     const inquiry: ProductInquiry = {
//       order: String(order),
//       page: Number(page),
//       limit: Number(limit),
//     };
//     if (productCollection)
//       inquiry.productCollection = productCollection as ProductCollection;
//     if (search) inquiry.search = String(search);
//     const result = await productService.getProducts(inquiry);
//     res.status(HttpCode.OK).json({ result });
//   } catch (err) {
//     if (err instanceof Errors) res.status(err.code).json(err);
//     else res.status(Errors.standard.code).json(Errors.standard);
//   }
// };

// productController.getProduct = async (req: ExtendedRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const memberId = req.member?._id ?? null;
//     const result = await productService.getProduct(memberId, id as string);

//     res.status(HttpCode.OK).json({ result: result });
//   } catch (err) {
//     if (err instanceof Errors) res.status(err.code).json(err);
//     else res.status(Errors.standard.code).json(Errors.standard);
//   }
// };

/**  SSR */
productController.getAllProducts = async (req: AdminRequest, res: Response) => {
  try {
    const [products, teams] = await Promise.all([
      productService.getAllProducts(),
      teamService.getAllTeams(),
    ]);
    console.log(products, teams);
    
    res.render("products", { products, teams });
  } catch (err) {
    console.log("Error, getAllProducts", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("createNewProduct");

    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });
    if(!data.teamId){
      delete data.teamId
    }
    await productService.createNewProduct(data);
    res.send(
      `<script>alert("Sucessful creation"); window.location.replace('/admin/product/all');</script>`,
    );
  } catch (err) {
    console.log("Error, createNewProduct", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/product/all');</script>`,
    );
  }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    const id = req.params.id;

    const result = await productService.updateChosenProduct(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;
