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
const router = express_1.default.Router();
// Get all FAQs
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const querySnapshot = yield firebase_1.db.collection('faqs')
            .orderBy('createdAt', 'desc')
            .get();
        const faqs = querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json(faqs);
    }
    catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ message: 'Error fetching FAQs' });
    }
}));
// Get FAQ by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const docRef = yield firebase_1.db.collection('faqs').doc(id).get();
        if (!docRef.exists) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        res.json(Object.assign({ id: docRef.id }, docRef.data()));
    }
    catch (error) {
        console.error('Error fetching FAQ:', error);
        res.status(500).json({ message: 'Error fetching FAQ' });
    }
}));
// Create new FAQ
router.post('/', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create FAQs' });
        }
        const { question, answer, category } = req.body;
        const faqData = {
            question,
            answer,
            category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId
        };
        const docRef = yield firebase_1.db.collection('faqs').add(faqData);
        res.status(201).json(Object.assign({ id: docRef.id }, faqData));
    }
    catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({ message: 'Error creating FAQ' });
    }
}));
// Delete FAQ
router.delete('/:id', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete FAQs' });
        }
        const { id } = req.params;
        const docRef = firebase_1.db.collection('faqs').doc(id);
        const doc = yield docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        yield docRef.delete();
        res.json({ message: 'FAQ deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({ message: 'Error deleting FAQ' });
    }
}));
exports.default = router;
