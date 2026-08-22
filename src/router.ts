import express, { Request, Response } from "express";
import memberController from "./controllers/member.controller";
import uploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";
import teamController from "./controllers/team.controller";
import playerController from "./controllers/player.controller";

const router = express.Router();

// Memeber
// router.get("/member/restaurant", memberController.getRestaurant);
router.post("/member/login", memberController.login);

router.post("/member/signup", memberController.signup);
router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout,
);
router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail,
);
router.post(
  "/member/update",
  memberController.verifyAuth,
  uploader("members").single("memberImage"),
  memberController.updateMember,
);

// Team
router.get("/team/all", teamController.getTeams);
router.get("/team/:id", memberController.retrieveAuth, teamController.getTeam)
router.get("/team/:id/subscribers", teamController.getTeamSubscribers);
router.get(
  "/team/:id/subscribe",
  memberController.verifyAuth, 
  teamController.subscribeTeam,
);
router.get(
  "/team/:id/unsubscribe",
  memberController.verifyAuth, 
  teamController.unsubscribeTeam,
);

router.get("/player/all", playerController.getPlayers);
router.get("/player/:id", memberController.retrieveAuth, playerController.getPlayer)

// router.get("/member/top-users", memberController.getTopUsers);

// // Product
// router.get("/product/all", productController.getProducts);
// router.get("/product/:id", memberController.retrieveAuth, productController.getProduct)

// // Order
// router.post("/order/create", memberController.verifyAuth, orderController.createOrder)
// router.get("/order/all", memberController.verifyAuth, orderController.getMyOrders)
// router.post("/order/update", memberController.verifyAuth, orderController.updateOrder)
export default router;
