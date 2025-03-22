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
exports.handleWebhook = exports.reactivateSubscription = exports.cancelSubscription = exports.getSubscriptionPlans = exports.getSubscriptionStatus = exports.createSubscription = void 0;
const subscriptionService_1 = require("../services/subscriptionService");
const User_1 = __importDefault(require("../models/User"));
const subscriptionService = new subscriptionService_1.SubscriptionService();
const createSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { priceId, paymentMethodId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        // Create Stripe customer if not exists
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            customerId = yield subscriptionService.createCustomer(user);
        }
        // Create subscription
        const subscription = yield subscriptionService.createSubscription(customerId, priceId, paymentMethodId);
        // Update user's subscription in database
        yield subscriptionService.updateSubscriptionInDatabase(userId.toString(), subscription);
        res.json({
            success: true,
            data: {
                subscriptionId: subscription.id,
                clientSecret: (_c = (_b = subscription.latest_invoice) === null || _b === void 0 ? void 0 : _b.payment_intent) === null || _c === void 0 ? void 0 : _c.client_secret
            }
        });
    }
    catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subscription'
        });
    }
});
exports.createSubscription = createSubscription;
const getSubscriptionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield User_1.default.findById(userId).select('+subscription');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({
            success: true,
            data: {
                subscription: user.subscription || null
            }
        });
    }
    catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription status'
        });
    }
});
exports.getSubscriptionStatus = getSubscriptionStatus;
const getSubscriptionPlans = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plans = yield subscriptionService.getSubscriptionPlans();
        res.json({
            success: true,
            data: plans
        });
    }
    catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription plans'
        });
    }
});
exports.getSubscriptionPlans = getSubscriptionPlans;
const cancelSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield User_1.default.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.subscription)) {
            res.status(404).json({ success: false, message: 'No active subscription found' });
            return;
        }
        const subscription = yield subscriptionService.cancelSubscription(user.subscription.planId);
        yield subscriptionService.updateSubscriptionInDatabase(userId.toString(), subscription);
        res.json({
            success: true,
            data: {
                subscription: user.subscription
            }
        });
    }
    catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error canceling subscription'
        });
    }
});
exports.cancelSubscription = cancelSubscription;
const reactivateSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield User_1.default.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.subscription)) {
            res.status(404).json({ success: false, message: 'No subscription found' });
            return;
        }
        const subscription = yield subscriptionService.reactivateSubscription(user.subscription.planId);
        yield subscriptionService.updateSubscriptionInDatabase(userId.toString(), subscription);
        res.json({
            success: true,
            data: {
                subscription: user.subscription
            }
        });
    }
    catch (error) {
        console.error('Error reactivating subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error reactivating subscription'
        });
    }
});
exports.reactivateSubscription = reactivateSubscription;
const handleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers['stripe-signature'];
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        yield subscriptionService.handleWebhookEvent(event);
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ success: false, message: 'Webhook error' });
    }
});
exports.handleWebhook = handleWebhook;
