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
  createAssignment,
  getAssignments,
  getAssignmentById,
  deleteAssignment,
  updateAssignment,
  getComputers
} from "../controllers/assignmentController.js";

const router = Router();

router.get("/get-users", getUsers);
router.post("/create-user", createUser);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);
router.post("/create-update-status/:id", updateStatus);

router.get("/get-access-requests", getAccessRequests);
router.post("/create-access-request", createAccessRequest);
router.put("/update-access-request/:id", updateAccessRequest);
router.delete("/delete-access-request/:id", deleteAccessRequest);
router.get("/get-access-request-by-id/:id", getAccessRequestById);

router.get("/get-assignments", getAssignments);
router.post("/create-assignment", createAssignment);
router.put("/update-assignment/:id", updateAssignment);
router.delete("/delete-assignment/:id", deleteAssignment);
router.get("/get-assignment-by-id/:id", getAssignmentById);
router.get("/get-computers", getComputers);

export default router;
