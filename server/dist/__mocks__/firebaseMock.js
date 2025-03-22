"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockFirestore = void 0;
exports.mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    where: jest.fn().mockReturnThis(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
};
