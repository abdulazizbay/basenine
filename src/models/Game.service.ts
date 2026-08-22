import { shapeIntoMongooseObjectId } from "../libs/config";
import { GameStatus } from "../libs/enums/game.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Game, GameInput } from "../libs/types/game";
import GameModel from "../schema/Game.model";

class GameService {
  private readonly gameModel;

  constructor() {
    this.gameModel = GameModel;
  }

  // SSR
  public async createNewGame(input: GameInput): Promise<Game> {
    try {
      return await this.gameModel.create(input);
    } catch (err) {
      console.log("Error, model: createNewGame:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  public async getAllGames(): Promise<Game[]> {
    const result = await this.gameModel
      .find()
      .populate("teamAId")
      .populate("teamBId")
      .lean<Game[]>()
      .sort({ gameDate: -1 })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }
  public async updateChosenGame(
    id: any,
    gameStatus: GameStatus,
  ): Promise<Game> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.gameModel
      .findByIdAndUpdate({ _id: id }, { gameStatus: gameStatus }, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  }
}
export default GameService;
