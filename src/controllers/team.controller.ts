import Errors, { HttpCode, Message } from "../libs/Errors";
import { Direction, T } from "../libs/types/common";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInquiry } from "../libs/types/product";
import {

  TeamInput,
  TeamInquiry,
  TeamOrder,
} from "../libs/types/team";
import TeamService from "../models/Team.service";
import { Response, Request } from "express";

const teamService = new TeamService();

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

teamController.getTeam = async (req: ExtendedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const memberId = req.member?._id ?? null;
    const result = await teamService.getTeam(memberId, id as string);

    res.status(HttpCode.OK).json({result});
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
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
