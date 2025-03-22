import { admin } from '../../config/firebase';
import { mockDeep } from 'jest-mock-extended';
// Mock Firebase Admin
jest.mock('../../config/firebase', () => ({
    admin: {
        firestore: jest.fn(() => ({
            collection: jest.fn(),
            runTransaction: jest.fn(),
        })),
    },
}));
describe('Quiz Routes', () => {
    let req;
    let res;
    let mockCollection;
    let mockDoc;
    let mockGet;
    let mockWhere;
    let mockOrderBy;
    let mockLimit;
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Mock request and response
        req = mockDeep();
        res = mockDeep();
        // Setup Firebase mocks
        mockGet = jest.fn();
        mockDoc = jest.fn(() => ({ get: mockGet }));
        mockWhere = jest.fn(() => ({ get: mockGet, orderBy: mockOrderBy }));
        mockOrderBy = jest.fn(() => ({ get: mockGet, limit: mockLimit }));
        mockLimit = jest.fn(() => ({ get: mockGet }));
        mockCollection = jest.fn(() => ({
            doc: mockDoc,
            where: mockWhere,
            orderBy: mockOrderBy,
            get: mockGet,
        }));
        admin.firestore.mockReturnValue({
            collection: mockCollection,
        });
    });
    describe('GET /quizzes', () => {
        const mockQuizzes = [
            {
                id: 'quiz1',
                title: 'Love Languages Assessment',
                description: 'Discover your primary love language',
                category: 'relationships',
                duration: 10,
                difficulty: 'beginner',
                data: () => ({
                    title: 'Love Languages Assessment',
                    description: 'Discover your primary love language',
                    category: 'relationships',
                    duration: 10,
                    difficulty: 'beginner',
                }),
            },
            {
                id: 'quiz2',
                title: 'Communication Style Quiz',
                description: 'Understand your communication style',
                category: 'communication',
                duration: 10,
                difficulty: 'intermediate',
                data: () => ({
                    title: 'Communication Style Quiz',
                    description: 'Understand your communication style',
                    category: 'communication',
                    duration: 10,
                    difficulty: 'intermediate',
                }),
            },
        ];
        it('should return all quizzes', async () => {
            mockGet.mockResolvedValueOnce({ docs: mockQuizzes });
            await require('../quizzes').default.get(req, res);
            expect(mockCollection).toHaveBeenCalledWith('quizzes');
            expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
            expect(res.json).toHaveBeenCalledWith({
                quizzes: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'quiz1',
                        title: 'Love Languages Assessment',
                    }),
                    expect.objectContaining({
                        id: 'quiz2',
                        title: 'Communication Style Quiz',
                    }),
                ]),
            });
        });
        it('should handle errors when fetching quizzes', async () => {
            const error = new Error('Database error');
            mockGet.mockRejectedValueOnce(error);
            await require('../quizzes').default.get(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Error fetching quizzes',
            });
        });
    });
    describe('GET /quizzes/:id', () => {
        const mockQuiz = {
            id: 'quiz1',
            data: () => ({
                title: 'Love Languages Assessment',
                description: 'Discover your primary love language',
                category: 'relationships',
                duration: 10,
                difficulty: 'beginner',
            }),
        };
        it('should return a specific quiz', async () => {
            req.params = { id: 'quiz1' };
            mockGet.mockResolvedValueOnce({ exists: true, ...mockQuiz });
            await require('../quizzes').default.getById(req, res);
            expect(mockCollection).toHaveBeenCalledWith('quizzes');
            expect(mockDoc).toHaveBeenCalledWith('quiz1');
            expect(res.json).toHaveBeenCalledWith({
                quiz: expect.objectContaining({
                    id: 'quiz1',
                    title: 'Love Languages Assessment',
                }),
            });
        });
        it('should return 404 for non-existent quiz', async () => {
            req.params = { id: 'nonexistent' };
            mockGet.mockResolvedValueOnce({ exists: false });
            await require('../quizzes').default.getById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Quiz not found',
            });
        });
    });
    describe('GET /quizzes/category/:category', () => {
        const mockQuizzes = [
            {
                id: 'quiz1',
                data: () => ({
                    title: 'Love Languages Assessment',
                    category: 'relationships',
                }),
            },
        ];
        it('should return quizzes by category', async () => {
            req.params = { category: 'relationships' };
            mockGet.mockResolvedValueOnce({ docs: mockQuizzes });
            await require('../quizzes').default.getByCategory(req, res);
            expect(mockCollection).toHaveBeenCalledWith('quizzes');
            expect(mockWhere).toHaveBeenCalledWith('category', '==', 'relationships');
            expect(res.json).toHaveBeenCalledWith({
                quizzes: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'quiz1',
                        title: 'Love Languages Assessment',
                    }),
                ]),
            });
        });
        it('should return empty array for category with no quizzes', async () => {
            req.params = { category: 'nonexistent' };
            mockGet.mockResolvedValueOnce({ docs: [] });
            await require('../quizzes').default.getByCategory(req, res);
            expect(res.json).toHaveBeenCalledWith({ quizzes: [] });
        });
    });
    describe('GET /quizzes/popular', () => {
        const mockPopularQuizzes = [
            {
                id: 'quiz1',
                data: () => ({
                    title: 'Love Languages Assessment',
                    completionCount: 100,
                }),
            },
        ];
        it('should return popular quizzes', async () => {
            mockGet.mockResolvedValueOnce({ docs: mockPopularQuizzes });
            await require('../quizzes').default.getPopular(req, res);
            expect(mockCollection).toHaveBeenCalledWith('quizzes');
            expect(mockOrderBy).toHaveBeenCalledWith('completionCount', 'desc');
            expect(mockLimit).toHaveBeenCalledWith(5);
            expect(res.json).toHaveBeenCalledWith({
                quizzes: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'quiz1',
                        title: 'Love Languages Assessment',
                    }),
                ]),
            });
        });
        it('should handle errors when fetching popular quizzes', async () => {
            const error = new Error('Database error');
            mockGet.mockRejectedValueOnce(error);
            await require('../quizzes').default.getPopular(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Error fetching popular quizzes',
            });
        });
    });
});
