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
exports.unsubscribeTopic = exports.subscribeTopic = exports.sendTopicNotification = exports.sendNotification = void 0;
const notificationService_1 = require("../services/notificationService");
const User_1 = __importDefault(require("../models/User"));
const notificationService = new notificationService_1.NotificationService();
const sendNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, title, body, data, imageUrl } = req.body;
        const user = yield User_1.default.findById(userId);
        if (!user || !user.fcmToken) {
            res.status(404).json({
                success: false,
                message: 'User not found or FCM token not registered'
            });
            return;
        }
        const payload = {
            title,
            body,
            data,
            imageUrl
        };
        yield notificationService.sendNotification(user, payload, user.fcmToken);
        res.json({
            success: true,
            message: 'Notification sent successfully'
        });
    }
    catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sending notification'
        });
    }
});
exports.sendNotification = sendNotification;
const sendTopicNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { topic, title, body, data, imageUrl } = req.body;
        const payload = {
            title,
            body,
            data,
            imageUrl
        };
        yield notificationService.sendTopicNotification(topic, payload);
        res.json({
            success: true,
            message: 'Topic notification sent successfully'
        });
    }
    catch (error) {
        console.error('Error sending topic notification:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sending topic notification'
        });
    }
});
exports.sendTopicNotification = sendTopicNotification;
const subscribeTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { topic } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield User_1.default.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.fcmToken)) {
            res.status(404).json({
                success: false,
                message: 'User not found or FCM token not registered'
            });
            return;
        }
        yield notificationService.subscribeToTopic([user.fcmToken], topic);
        res.json({
            success: true,
            message: 'Successfully subscribed to topic'
        });
    }
    catch (error) {
        console.error('Error subscribing to topic:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error subscribing to topic'
        });
    }
});
exports.subscribeTopic = subscribeTopic;
const unsubscribeTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { topic } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield User_1.default.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.fcmToken)) {
            res.status(404).json({
                success: false,
                message: 'User not found or FCM token not registered'
            });
            return;
        }
        yield notificationService.unsubscribeFromTopic([user.fcmToken], topic);
        res.json({
            success: true,
            message: 'Successfully unsubscribed from topic'
        });
    }
    catch (error) {
        console.error('Error unsubscribing from topic:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error unsubscribing from topic'
        });
    }
});
exports.unsubscribeTopic = unsubscribeTopic;
