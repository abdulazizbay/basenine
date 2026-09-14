import Errors, { HttpCode, Message } from "../libs/Errors";
import { Direction, T } from "../libs/types/common";
import { GameInput, GameInquiry } from "../libs/types/game";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { Response, Request } from "express";
import GameService from "../models/Game.service";
import TeamService from "../models/Team.service";
import { GameStatus } from "../libs/enums/game.enum";
import { Address } from "../libs/enums/common.enum";

const gameService = new GameService();
const teamService = new TeamService();

const gameController: T = {};

// SPA
gameController.getGames = async (req: ExtendedRequest, res: Response) => {
  try {
    const { page, limit, gameAddress, gameStatus, startDate, endDate, teamId } =
      req.query;

    const inquiry: GameInquiry = {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    };

    if (gameAddress) inquiry.gameAddress = gameAddress as Address;
    if (gameStatus) inquiry.gameStatus = gameStatus as GameStatus;
    if (startDate) inquiry.startDate = new Date(startDate as string);
    if (endDate) inquiry.endDate = new Date(endDate as string);
    if (teamId) inquiry.teamId = String(teamId);

    const result = await gameService.getGames(inquiry);
    res.json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

gameController.getGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await gameService.getGame(String(id));
    res.json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

gameController.getStandings = async (req: Request, res: Response) => {
  try {
    const result = await gameService.getStandings();
    res.json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// playerController.getPlayer = async (req: ExtendedRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const memberId = req.member?._id ?? null;
//     const result = await playerService.getPlayer(memberId, id as string);

//     res.status(HttpCode.OK).json({ result });
//   } catch (err) {
//     if (err instanceof Errors) res.status(err.code).json(err);
//     else res.status(Errors.standard.code).json(Errors.standard);
//   }
// };

// /**  SSR */
gameController.createNewGame = async (req: AdminRequest, res: Response) => {
  try {
    const data: GameInput = req.body;

    await gameService.createNewGame(data);
    res.send(
      `<script>alert("Sucessful creation"); window.location.replace('/admin/game/all');</script>`,
    );
  } catch (err) {
    console.log("Error, createNewPlayer", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace('/admin/game/all');</script>`,
    );
  }
};

gameController.getAllGames = async (req: AdminRequest, res: Response) => {
  try {
    const [games, teams] = await Promise.all([
      gameService.getAllGames(),
      teamService.getAllTeams(),
    ]);

    res.render("games", { games, teams });
  } catch (err) {
    console.log("Error, getAllGames", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

gameController.updateChosenGame = async (req: AdminRequest, res: Response) => {
  try {
    const id = req.params.id;

    const result = await gameService.updateChosenGame(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenGame", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default gameController;
