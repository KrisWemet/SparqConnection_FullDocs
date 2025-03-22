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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const twilio_1 = __importDefault(require("twilio"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
// Initialize Twilio client
const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// Initialize SendGrid
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || '');
const router = express_1.default.Router();
// Send invitation
router.post('/', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { method, recipient, message } = req.body;
        // Get user details for personalization
        const userDoc = yield firebase_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userData = userDoc.data();
        const senderName = (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'A friend';
        // Generate invite code
        const inviteCode = generateInviteCode();
        // Store invitation in database
        const inviteData = {
            senderId: userId,
            recipient,
            method,
            inviteCode,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        yield firebase_1.db.collection('invites').add(inviteData);
        // Send invitation based on method
        const inviteUrl = `${process.env.APP_URL}/join?code=${inviteCode}`;
        if (method === 'sms') {
            yield sendSMSInvite(recipient, senderName, message, inviteUrl, inviteCode);
        }
        else {
            yield sendEmailInvite(recipient, senderName, message, inviteUrl, inviteCode);
        }
        res.json({ message: 'Invitation sent successfully', inviteCode });
    }
    catch (error) {
        console.error('Error sending invitation:', error);
        res.status(500).json({ message: 'Error sending invitation' });
    }
}));
// Helper functions
function sendEmailInvite(email, senderName, personalMessage, inviteUrl, inviteCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@sparqconnection.com',
            templateId: process.env.SENDGRID_INVITE_TEMPLATE_ID,
            dynamicTemplateData: {
                senderName,
                personalMessage,
                inviteUrl,
                inviteCode
            }
        };
        yield mail_1.default.send(Object.assign(Object.assign({}, msg), { text: `${senderName} has invited you to join Sparq Connection! Click here to join: ${inviteUrl}` }));
    });
}
function sendSMSInvite(phone, senderName, personalMessage, inviteUrl, inviteCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = personalMessage
            ? `${senderName} has invited you to join Sparq Connection: "${personalMessage}". Join here: ${inviteUrl}`
            : `${senderName} has invited you to join Sparq Connection! Join here: ${inviteUrl}`;
        yield twilioClient.messages.create({
            body: message,
            to: phone,
            from: process.env.TWILIO_PHONE_NUMBER
        });
    });
}
function generateInviteCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}
exports.default = router;
