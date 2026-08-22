import express from "express";
import adminController from "./controllers/admin.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploader";
import teamController from "./controllers/team.controller";
import playerController from "./controllers/player.controller";
import gameController from "./controllers/game.controller";
const routerAdmin = express.Router();

// admin
routerAdmin.get("/", adminController.goHome);

routerAdmin
  .get("/login", adminController.getLogin)
  .post("/login", adminController.processLogin);

routerAdmin
  .get("/signup", adminController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    adminController.processSignup,
  );

routerAdmin.get("/logout", adminController.logout);
routerAdmin.get("/check-me", adminController.checkAuthSession);

// Product
routerAdmin.get(
  "/product/all",
  adminController.verifyAdmin,
  productController.getAllProducts,
);
routerAdmin.post(
  "/product/create",
  adminController.verifyAdmin,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct,
);
routerAdmin.post(
  "/product/:id",
  adminController.verifyAdmin,
  productController.updateChosenProduct,
);

// User
routerAdmin.get(
  "/user/all",
  adminController.verifyAdmin,
  adminController.getUsers,
);
// routerAdmin.post(
//   "/user/edit",
//   adminController.verifyAdmin,
//   adminController.updateChosenUser,
// );

// Team
routerAdmin.post(
  "/team/create",
  adminController.verifyAdmin,
  makeUploader("teams").array("teamImage", 5),
  teamController.createNewTeam,
);
routerAdmin.get(
  "/team/all",
  adminController.verifyAdmin,
  teamController.getAllTeams,
);
routerAdmin.post(
  "/team/:id",
  adminController.verifyAdmin,
  teamController.updateChosenTeam,
);

// Player
routerAdmin.post(
  "/player/create",
  adminController.verifyAdmin,
  makeUploader("players").array("playerImages", 5),
  playerController.createNewPlayer,
);
routerAdmin.get(
  "/player/all",
  adminController.verifyAdmin,
  playerController.getAllPlayers,
);

// Game
routerAdmin.post(
  "/game/create",
  adminController.verifyAdmin,
  gameController.createNewGame,
);
routerAdmin.get(
  "/game/all",
  adminController.verifyAdmin,
  gameController.getAllGames,
);
routerAdmin.post(
  "/game/:id",
  adminController.verifyAdmin,
  gameController.updateChosenGame,
);
export default routerAdmin;
