"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.initializeFirebase = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const initializeFirebase = () => {
    var _a;
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n')
    };
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccount)
    });
};
exports.initializeFirebase = initializeFirebase;
exports.db = (0, firestore_1.getFirestore)();
exports.default = { db: exports.db, initializeFirebase: exports.initializeFirebase };
