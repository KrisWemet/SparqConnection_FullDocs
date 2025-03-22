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
exports.authenticateToken = void 0;
exports.authenticateToken = jest.fn((req, res, next) => {
    req.user = {
        _id: 'user1',
        id: 'user1',
        uid: 'user1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        isModerator: false,
        isAdmin: false,
        lastLogin: new Date(),
        role: 'user',
        fcmToken: undefined,
        notificationPreferences: {
            dailyPrompts: true,
            quizzes: true,
            achievements: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: (candidatePassword) => __awaiter(void 0, void 0, void 0, function* () { return true; })
    };
    next();
});
