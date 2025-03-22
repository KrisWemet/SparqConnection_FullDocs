"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const quizController_1 = require("../controllers/quizController");
const router = express_1.default.Router();
// Protected routes
router.use(passport_1.default.authenticate('jwt', { session: false }));
// Get all quizzes
router.get('/', quizController_1.getQuizzes);
// Get quiz by ID
router.get('/:id', quizController_1.getQuizById);
// Submit quiz response
router.post('/response', quizController_1.submitQuizResponse);
exports.default = router;
