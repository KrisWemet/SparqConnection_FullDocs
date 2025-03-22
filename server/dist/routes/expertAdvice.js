"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expertAdviceController_1 = require("../controllers/expertAdviceController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all expert advice (with unlock status)
router.get('/', auth_1.authenticateToken, expertAdviceController_1.getExpertAdvice);
// Get specific expert advice by ID
router.get('/:id', auth_1.authenticateToken, expertAdviceController_1.getExpertAdviceById);
exports.default = router;
