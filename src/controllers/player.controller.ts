import Errors, { HttpCode, Message } from "../libs/Errors";
import { Direction, T } from "../libs/types/common";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { PlayerInput, PlayerInquiry } from "../libs/types/player";
import PlayerService from "../models/Player.service";
import { Response, Request } from "express";
import TeamService from "../models/Team.service";
import { PlayerOrder } from "../libs/enums/player.enum";

const playerService = new PlayerService();
const teamService = new TeamService();

const playerController: T = {};

// SPA
playerController.getPlayers = async (req: Request, res: Response) => {
  try {
    const { page, limit, order, direction, search } = req.query;
    const inquiry: PlayerInquiry = {
      order: order as PlayerOrder,
      page: Number(page),
      limit: Number(limit),
      direction: Number(direction) as Direction,
    };
    if (search) inquiry.search = String(search);
    const result = await playerService.getPlayers(inquiry);
    res.status(HttpCode.OK).json({ result });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

playerController.getPlayer = async (req: ExtendedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const memberId = req.member?._id ?? null;
    const result = await playerService.getPlayer(memberId, id as string);

    res.status(HttpCode.OK).json({ result });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// /**  SSR */
playerController.createNewPlayer = async (req: AdminRequest, res: Response) => {
  try {
    console.log("createNewPlayer");
    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    const data: PlayerInput = req.body;
    data.playerImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });
    if (!data.teamId) {
      delete data.teamId;
    }
    await playerService.createNewPlayer(data);
    res.send(
      `<script>alert("Sucessful creation"); window.location.replace('/admin/player/all');</script>`,
    );
  } catch (err) {
    console.log("Error, createNewPlayer", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/player/all');</script>`,
    );
  }
};

playerController.getAllPlayers = async (req: AdminRequest, res: Response) => {
  try {
    const [players, teams] = await Promise.all([
      playerService.getAllPlayers(),
      teamService.getAllTeams(),
    ]);

    res.render("players", { players, teams });
  } catch (err) {
    console.log("Error, getAllPlayers", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default playerController;
