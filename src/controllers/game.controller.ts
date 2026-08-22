import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { GameInput } from "../libs/types/game";
import { AdminRequest } from "../libs/types/member";
import { Response, Request } from "express";
import GameService from "../models/Game.service";
import TeamService from "../models/Team.service";
import { GameStatus } from "../libs/enums/game.enum";

const gameService = new GameService;
const teamService = new TeamService

const gameController: T = {};

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
    console.log(games);
    
    res.render("games", { games, teams });
  } catch (err) {
    console.log("Error, getAllGames", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

gameController.updateChosenGame = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const {gameStatus} = req.body
    const result = await gameService.updateChosenGame(id, gameStatus);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenGame", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};


export default gameController;
