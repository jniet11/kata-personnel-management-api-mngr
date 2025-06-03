import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  updateStatus,
} from "../controllers/createUserController";
import {
  createAccessRequest,
  getAccessRequests,
  getAccessRequestById,
  updateAccessRequest,
  deleteAccessRequest,
} from "../controllers/accessRequestController.js";
import {
  createComputer,
  getComputers,
  getComputerById,
  updateComputer,
  // deleteComputer, // Si se implementa
} from "../controllers/computerController.js";

const router = Router();

router.get("/get-users", getUsers);
router.post("/create-user", createUser);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);
router.post("/create-update-status/:id", updateStatus);

router.get("/get-access-requests", getAccessRequests);
router.post("/create-access-request", createAccessRequest);
router.put("/update-access-request/:id", updateAccessRequest);
router.get("/get-access-request-by-id/:id", getAccessRequestById);
router.delete("/delete-access-request/:id", deleteAccessRequest);

router.post("/", createComputer);
router.get("/", getComputers);
router.get("/:id", getComputerById);
router.put("/:id", updateComputer);

export default router;
