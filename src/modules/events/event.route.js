import { Router } from "express";
import { create, readPublic, readOwn, update, remove, subscribers, subscribe, unsubscribe, subscriptions } from "./event.controller.js";
import validateMongoId from "../../middlewares/validate_mongo_id.middleware.js";
import rolesMiddleware from "../../middlewares/roles.middleware.js";
import { UserRoles } from "../user/user.enum.js";

const router = Router();
router.post("/", rolesMiddleware(UserRoles.ORGANISER), create);
router.get("/", readPublic);
router.get("/own", rolesMiddleware(UserRoles.ORGANISER), readOwn);
router.put("/:id", rolesMiddleware(UserRoles.ORGANISER), validateMongoId, update);
router.delete("/:id", rolesMiddleware(UserRoles.ORGANISER), validateMongoId, remove);
router.get("/:id/subscribers", [rolesMiddleware(UserRoles.ORGANISER),validateMongoId], subscribers);
router.get("/:id/subscribe", [rolesMiddleware(UserRoles.PARTICIPANT), validateMongoId], subscribe);
router.get("/:id/unsubscribe", [rolesMiddleware(UserRoles.PARTICIPANT), validateMongoId], unsubscribe);
router.get("/subscriptions", rolesMiddleware(UserRoles.PARTICIPANT), subscriptions);
export default router;