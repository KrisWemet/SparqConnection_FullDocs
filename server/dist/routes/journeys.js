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
// Get all journeys
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const querySnapshot = yield firebase_1.db.collection('journeys')
            .orderBy('createdAt', 'desc')
            .get();
        const journeys = querySnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.json(journeys);
    }
    catch (error) {
        console.error('Error fetching journeys:', error);
        res.status(500).json({ message: 'Error fetching journeys' });
    }
}));
// Get journey by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const docRef = yield firebase_1.db.collection('journeys').doc(id).get();
        if (!docRef.exists) {
            return res.status(404).json({ message: 'Journey not found' });
        }
        const journey = Object.assign({ id: docRef.id }, docRef.data());
        res.json(journey);
    }
    catch (error) {
        console.error('Error fetching journey:', error);
        res.status(500).json({ message: 'Error fetching journey' });
    }
}));
// Create new journey
router.post('/', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create journeys' });
        }
        const journeyData = Object.assign(Object.assign({}, req.body), { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: userId });
        const docRef = yield firebase_1.db.collection('journeys').add(journeyData);
        const newJourney = Object.assign({ id: docRef.id }, journeyData);
        res.status(201).json(newJourney);
    }
    catch (error) {
        console.error('Error creating journey:', error);
        res.status(500).json({ message: 'Error creating journey' });
    }
}));
// Update journey
router.put('/:id', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update journeys' });
        }
        const { id } = req.params;
        const docRef = firebase_1.db.collection('journeys').doc(id);
        const doc = yield docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Journey not found' });
        }
        const updateData = Object.assign(Object.assign({}, req.body), { updatedAt: new Date().toISOString() });
        yield docRef.update(updateData);
        const updatedDoc = yield docRef.get();
        const updatedJourney = Object.assign({ id: updatedDoc.id }, updatedDoc.data());
        res.json(updatedJourney);
    }
    catch (error) {
        console.error('Error updating journey:', error);
        res.status(500).json({ message: 'Error updating journey' });
    }
}));
// Delete journey
router.delete('/:id', auth_1.validateAuthToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.uid;
        if (!userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete journeys' });
        }
        const { id } = req.params;
        const docRef = firebase_1.db.collection('journeys').doc(id);
        const doc = yield docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Journey not found' });
        }
        yield docRef.delete();
        res.json({ message: 'Journey deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting journey:', error);
        res.status(500).json({ message: 'Error deleting journey' });
    }
}));
exports.default = router;
