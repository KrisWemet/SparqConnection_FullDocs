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
exports.userService = exports.UserService = void 0;
const firebase_1 = require("../config/firebase");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    constructor() {
        this.collection = firebase_1.db.collection('users');
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcryptjs_1.default.hash(userData.password, 10);
            const now = new Date();
            const userDoc = yield this.collection.add(Object.assign(Object.assign({}, userData), { password: hashedPassword, createdAt: now, updatedAt: now }));
            return Object.assign(Object.assign({ id: userDoc.id }, userData), { password: hashedPassword, createdAt: now, updatedAt: now });
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot = yield this.collection.where('email', '==', email).get();
            if (snapshot.empty)
                return null;
            const doc = snapshot.docs[0];
            return Object.assign({ id: doc.id }, doc.data());
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield this.collection.doc(id).get();
            if (!doc.exists)
                return null;
            return Object.assign({ id: doc.id }, doc.data());
        });
    }
    updateUser(id, update) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.collection.doc(id).update(Object.assign(Object.assign({}, update), { updatedAt: new Date() }));
        });
    }
    comparePassword(user, candidatePassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(candidatePassword, user.password);
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.collection.doc(id).delete();
        });
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
// Default export for use in import statements
exports.default = exports.userService;
