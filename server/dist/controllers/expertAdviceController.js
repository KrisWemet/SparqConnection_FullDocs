"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpertAdviceById = exports.getExpertAdvice = void 0;
const firestoreService_1 = require("../services/firestoreService");
const Gamification_1 = __importDefault(require("../models/Gamification"));
const getExpertAdvice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Get user's points from gamification data
        const gamificationData = yield Gamification_1.default.findOne({ user: userId });
        const userPoints = (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.points) || 0;
        // Fetch all expert advice from Firestore
        const expertAdvice = yield firestoreService_1.expertAdviceService.getAllExpertAdvice();
        // Mark tips as locked/unlocked based on user's points
        const processedAdvice = expertAdvice.map(tip => (Object.assign(Object.assign({}, tip), { is_unlocked: userPoints >= tip.points_required, points_needed: Math.max(0, tip.points_required - userPoints) })));
        // Group tips by category
        const groupedAdvice = processedAdvice.reduce((acc, tip) => {
            if (!acc[tip.category]) {
                acc[tip.category] = [];
            }
            acc[tip.category].push(tip);
            return acc;
        }, {});
        res.json({
            user_points: userPoints,
            tips_by_category: groupedAdvice
        });
    }
    catch (error) {
        console.error('Error fetching expert advice:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getExpertAdvice = getExpertAdvice;
const getExpertAdviceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        // Get user's points
        const gamificationData = yield Gamification_1.default.findOne({ user: userId });
        const userPoints = (gamificationData === null || gamificationData === void 0 ? void 0 : gamificationData.points) || 0;
        // Fetch specific tip from Firestore
        const tip = yield firestoreService_1.expertAdviceService.getExpertAdviceById(id);
        if (!tip) {
            res.status(404).json({ message: 'Expert advice not found' });
            return;
        }
        // Check if user has enough points
        if (userPoints < tip.points_required) {
            res.status(403).json({
                message: 'Not enough points to unlock this tip',
                points_needed: tip.points_required - userPoints
            });
            return;
        }
        res.json(Object.assign(Object.assign({}, tip), { is_unlocked: true }));
    }
    catch (error) {
        console.error('Error fetching expert advice:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getExpertAdviceById = getExpertAdviceById;
