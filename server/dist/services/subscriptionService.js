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
exports.SubscriptionService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const User_1 = __importDefault(require("../models/User"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
class SubscriptionService {
    createCustomer(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                metadata: {
                    userId: user._id.toString()
                }
            });
            yield User_1.default.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
            return customer.id;
        });
    }
    createSubscription(customerId, priceId, paymentMethodId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Attach payment method to customer
            yield stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId
            });
            // Set as default payment method
            yield stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId
                }
            });
            // Create subscription
            const subscription = yield stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                expand: ['latest_invoice.payment_intent']
            });
            return subscription;
        });
    }
    cancelSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true
            });
        });
    }
    reactivateSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: false
            });
        });
    }
    updateSubscriptionInDatabase(userId, subscription) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionData = {
                status: subscription.status,
                planId: subscription.items.data[0].price.id,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            };
            yield User_1.default.findByIdAndUpdate(userId, {
                subscription: subscriptionData
            });
        });
    }
    getSubscriptionPlans() {
        return __awaiter(this, void 0, void 0, function* () {
            const prices = yield stripe.prices.list({
                active: true,
                type: 'recurring',
                expand: ['data.product']
            });
            return prices.data;
        });
    }
    handleWebhookEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (event.type) {
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object;
                    const customer = yield stripe.customers.retrieve(subscription.customer);
                    if (typeof customer === 'string')
                        return;
                    const userId = customer.metadata.userId;
                    yield this.updateSubscriptionInDatabase(userId, subscription);
                    break;
                }
                case 'invoice.payment_succeeded': {
                    const invoice = event.data.object;
                    if (!invoice.subscription)
                        return;
                    const subscription = yield stripe.subscriptions.retrieve(invoice.subscription);
                    const customer = yield stripe.customers.retrieve(subscription.customer);
                    if (typeof customer === 'string')
                        return;
                    const userId = customer.metadata.userId;
                    yield this.updateSubscriptionInDatabase(userId, subscription);
                    break;
                }
                case 'invoice.payment_failed': {
                    const invoice = event.data.object;
                    if (!invoice.subscription)
                        return;
                    const subscription = yield stripe.subscriptions.retrieve(invoice.subscription);
                    const customer = yield stripe.customers.retrieve(subscription.customer);
                    if (typeof customer === 'string')
                        return;
                    const userId = customer.metadata.userId;
                    yield this.updateSubscriptionInDatabase(userId, subscription);
                    break;
                }
            }
        });
    }
}
exports.SubscriptionService = SubscriptionService;
