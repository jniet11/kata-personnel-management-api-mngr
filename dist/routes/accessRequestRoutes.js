"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accessRequestController_js_1 = require("../controllers/accessRequestController.js");
const router = (0, express_1.Router)();
router.post("/", accessRequestController_js_1.createAccessRequest);
router.get("/", accessRequestController_js_1.getAccessRequests);
router.get("/:id", accessRequestController_js_1.getAccessRequestById);
router.patch("/:id/status", accessRequestController_js_1.updateAccessRequestStatus); // PATCH es más semántico para actualizaciones parciales
router.delete("/:id", accessRequestController_js_1.deleteAccessRequest);
exports.default = router;
