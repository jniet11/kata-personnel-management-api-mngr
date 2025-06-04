"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const createUserController_js_1 = require("../controllers/createUserController.js");
const router = (0, express_1.Router)();
router.post("/create-user", createUserController_js_1.createUser);
router.get("/get-users", createUserController_js_1.getUsers);
exports.default = router;
