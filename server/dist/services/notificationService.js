"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.NotificationService = void 0;
const admin = __importStar(require("firebase-admin"));
class NotificationService {
    constructor() {
        var _a;
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n')
                })
            });
        }
    }
    sendNotification(user, payload, fcmToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = {
                    notification: {
                        title: payload.title,
                        body: payload.body,
                        imageUrl: payload.imageUrl
                    },
                    data: payload.data,
                    token: fcmToken
                };
                const response = yield admin.messaging().send(message);
                return response;
            }
            catch (error) {
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    // Handle invalid or expired token
                    // You might want to remove the token from the user's record
                    throw new Error('Invalid FCM token');
                }
                throw error;
            }
        });
    }
    sendMulticastNotification(tokens, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = {
                    notification: {
                        title: payload.title,
                        body: payload.body,
                        imageUrl: payload.imageUrl
                    },
                    data: payload.data,
                    tokens: tokens
                };
                const response = yield admin.messaging().sendMulticast(message);
                return response;
            }
            catch (error) {
                throw error;
            }
        });
    }
    sendTopicNotification(topic, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = {
                    notification: {
                        title: payload.title,
                        body: payload.body,
                        imageUrl: payload.imageUrl
                    },
                    data: payload.data,
                    topic: topic
                };
                const response = yield admin.messaging().send(message);
                return response;
            }
            catch (error) {
                throw error;
            }
        });
    }
    subscribeToTopic(tokens, topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield admin.messaging().subscribeToTopic(tokens, topic);
            }
            catch (error) {
                throw error;
            }
        });
    }
    unsubscribeFromTopic(tokens, topic) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield admin.messaging().unsubscribeFromTopic(tokens, topic);
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.NotificationService = NotificationService;
