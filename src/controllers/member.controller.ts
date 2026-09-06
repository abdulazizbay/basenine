import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import {
  ExtendedRequest,
  LoginInput,
  MemberInput,
  MemberUpdateInput,
} from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import MemberService from "../models/Member.service";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";
import FavouriteService from "../models/Favourite.service";

const memberService = new MemberService();
const authService = new AuthService();
const favouriteService = new FavouriteService();

const memberController: T = {};

// memberController.getRestaurant = async (req: Request, res: Response) => {
//   try {
//     const result = await memberService.getRestaurant();
//     res.status(HttpCode.OK).json(result);
//   } catch (err) {
//     if (err instanceof Errors) res.status(err.code).json(err);
//     else res.status(Errors.standard.code).json(Errors.standard.message);
//   }
// };
memberController.login = async (req: Request, res: Response) => {
  try {
    const input: LoginInput = req.body;

    const memberService = new MemberService();

    const result = await memberService.login(input);

    const token = await authService.createToken(result);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({
      member: result,
      accessToken: token,
    });
  } catch (err) {
    console.log("Error, login", err);

    if (err instanceof Errors) {
      res.status(err.code).json(err);
    } else {
      res.status(Errors.standard.code).json(Errors.standard.message);
    }
  }
};

memberController.signup = async (req: Request, res: Response) => {
  try {
    const input: MemberInput = req.body,
      result = await memberService.signup(input),
      token = await authService.createToken(result);
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });
    res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.message);
    // res.json({});
  }
};

memberController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.message);
  }
};

memberController.getMemberDetail = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    const [member, favourites] = await Promise.all([
      memberService.getMemberDetail(req.member),
      favouriteService.getFavourites(req.member),
    ]);

    res.status(HttpCode.OK).json({
      ...member,
      favourites,
    });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.message);
  }
};

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    const input: MemberUpdateInput = req.body;
    if (req.file) input.memberImage = req.file.path.replace(/\\/, "/");
    const result = await memberService.updateMember(req.member, input);

    const token = await authService.createToken(result);
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.message);
  }
};


memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    if (!req.member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next();
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard.message);
  }
};

memberController.retrieveAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies["accessToken"];
    
    if (token) req.member = await authService.checkAuth(token);

    next();
  } catch (err) {
    next();
  }
};
export default memberController;
