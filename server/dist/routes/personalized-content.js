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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const personalizationService_1 = require("../services/personalizationService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route GET /api/personalized-content
 * @desc Get personalized prompts and quizzes based on user preferences
 * @access Private
 */
router.get('/', auth_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const userId = req.user.id;
        const type = req.query.type || 'both';
        const content = yield personalizationService_1.personalizationService.getPersonalizedContent(userId, type);
        res.json({
            success: true,
            data: content
        });
    }
    catch (error) {
        console.error('Error fetching personalized content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch personalized content'
        });
    }
}));
exports.default = router;
