import { shapeIntoMongooseObjectId } from "../libs/config";
import { FavouriteGroup } from "../libs/enums/favourites.enum";
import { TeamOrder } from "../libs/enums/team.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Direction, OrdinaryInquiry, T } from "../libs/types/common";
import { FavouriteInput } from "../libs/types/favourite";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInquiry } from "../libs/types/product";
import { TeamInput, TeamInquiry } from "../libs/types/team";
import FavouriteService from "../models/Favourite.service";
import TeamService from "../models/Team.service";
import { Response, Request } from "express";

const teamService = new TeamService();
const favouriteService = new FavouriteService();

const teamController: T = {};

// SPA
teamController.getTeams = async (req: Request, res: Response) => {
  try {
    const { page, limit, order, direction, search } = req.query;
    const inquiry: TeamInquiry = {
      order: order as TeamOrder,
      page: Number(page),
      limit: Number(limit),
      direction: Number(direction) as Direction,
    };
    if (search) inquiry.search = String(search);
    const result = await teamService.getTeams(inquiry);
    res.status(HttpCode.OK).json({ result });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

teamController.getTeamOptions = async (req: Request, res: Response) => {
  try {
    const result = await teamService.getTeamOptions();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

teamController.getTeam = async (req: ExtendedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const memberId = req.member?._id ?? null;
    const result = await teamService.getTeam(memberId, id as string);

    res.status(HttpCode.OK).json({ result });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};
teamController.getTeamSubscribers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const result = await favouriteService.getTeamSubscribers(
      String(id),
      page,
      limit,
    );
    res.json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

teamController.subscribeTeam = async (req: ExtendedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const input: FavouriteInput = {
      memberId: req.member._id,
      favouriteGroup: FavouriteGroup.TEAM,
      favouriteRefId: shapeIntoMongooseObjectId(id),
    };

    const result = await favouriteService.addFavourite(input);
    res.json({ result });
  } catch (err) {
    console.log("Error, subscribeTeam", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.status(err instanceof Errors ? err.code : 400).json({ message });
  }
};

teamController.unsubscribeTeam = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const input: FavouriteInput = {
      memberId: req.member._id,
      favouriteGroup: FavouriteGroup.TEAM,
      favouriteRefId: shapeIntoMongooseObjectId(id),
    };

    await favouriteService.deleteFavourite(input);
    res.json({ data: true });
  } catch (err) {
    console.log("Error, unsubscribeTeam", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.status(err instanceof Errors ? err.code : 400).json({ message });
  }
};

teamController.getVisitedTeams = async (req: ExtendedRequest, res: Response) => {
  try {
   
    const memberId = req.member._id;
    const { page, limit } = req.query;
    const inquiry: OrdinaryInquiry = {
      page: Number(page),
      limit: Number(limit),
    };

    const result = await teamService.getVisitedTeams(memberId, inquiry);
    res.json(result);
  } catch (err) {
    console.log("Error, getVisitedTeams", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.status(err instanceof Errors ? err.code : 400).json({ message });
  }
};

// /**  SSR */
teamController.createNewTeam = async (req: AdminRequest, res: Response) => {
  try {
    console.log("createNewTeam");
    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    const data: TeamInput = req.body;
    data.teamImage = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });
    await teamService.createNewTeam(data);
    res.send(
      `<script>alert("Sucessful creation"); window.location.replace('/admin/team/all');</script>`,
    );
  } catch (err) {
    console.log("Error, createNewProduct", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/team/all');</script>`,
    );
  }
};

teamController.getAllTeams = async (req: AdminRequest, res: Response) => {
  try {
    const data = await teamService.getAllTeams();

    res.render("teams", { teams: data });
  } catch (err) {
    console.log("Error, getAllTeams", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

teamController.updateChosenTeam = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenTeam");
    const id = req.params.id;

    const result = await teamService.updateChosenTeam(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenTeam", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default teamController;
