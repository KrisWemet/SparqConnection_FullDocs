export const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    where: jest.fn().mockReturnThis(),
    add: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
};
