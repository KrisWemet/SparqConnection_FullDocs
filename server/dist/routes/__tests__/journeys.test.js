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
describe('Journey Routes', () => {
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
    describe('GET /journeys', () => {
        const mockJourneys = [
            {
                id: 'journey1',
                title: '5 Love Languages',
                description: 'Understanding love languages',
                category: 'relationships',
                duration: 7,
                difficulty: 'beginner',
                data: () => ({
                    title: '5 Love Languages',
                    description: 'Understanding love languages',
                    category: 'relationships',
                    duration: 7,
                    difficulty: 'beginner',
                }),
            },
            {
                id: 'journey2',
                title: 'Mindful Communication',
                description: 'Learn to communicate mindfully',
                category: 'communication',
                duration: 7,
                difficulty: 'intermediate',
                data: () => ({
                    title: 'Mindful Communication',
                    description: 'Learn to communicate mindfully',
                    category: 'communication',
                    duration: 7,
                    difficulty: 'intermediate',
                }),
            },
        ];
        it('should return all journeys', async () => {
            mockGet.mockResolvedValueOnce({ docs: mockJourneys });
            await require('../journeys').default.get(req, res);
            expect(mockCollection).toHaveBeenCalledWith('journeys');
            expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
            expect(res.json).toHaveBeenCalledWith({
                journeys: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'journey1',
                        title: '5 Love Languages',
                    }),
                    expect.objectContaining({
                        id: 'journey2',
                        title: 'Mindful Communication',
                    }),
                ]),
            });
        });
        it('should handle errors when fetching journeys', async () => {
            const error = new Error('Database error');
            mockGet.mockRejectedValueOnce(error);
            await require('../journeys').default.get(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Error fetching journeys',
            });
        });
    });
    describe('GET /journeys/:id', () => {
        const mockJourney = {
            id: 'journey1',
            data: () => ({
                title: '5 Love Languages',
                description: 'Understanding love languages',
                category: 'relationships',
                duration: 7,
                difficulty: 'beginner',
            }),
        };
        it('should return a specific journey', async () => {
            req.params = { id: 'journey1' };
            mockGet.mockResolvedValueOnce({ exists: true, ...mockJourney });
            await require('../journeys').default.getById(req, res);
            expect(mockCollection).toHaveBeenCalledWith('journeys');
            expect(mockDoc).toHaveBeenCalledWith('journey1');
            expect(res.json).toHaveBeenCalledWith({
                journey: expect.objectContaining({
                    id: 'journey1',
                    title: '5 Love Languages',
                }),
            });
        });
        it('should return 404 for non-existent journey', async () => {
            req.params = { id: 'nonexistent' };
            mockGet.mockResolvedValueOnce({ exists: false });
            await require('../journeys').default.getById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Journey not found',
            });
        });
    });
    describe('GET /journeys/category/:category', () => {
        const mockJourneys = [
            {
                id: 'journey1',
                data: () => ({
                    title: '5 Love Languages',
                    category: 'relationships',
                }),
            },
        ];
        it('should return journeys by category', async () => {
            req.params = { category: 'relationships' };
            mockGet.mockResolvedValueOnce({ docs: mockJourneys });
            await require('../journeys').default.getByCategory(req, res);
            expect(mockCollection).toHaveBeenCalledWith('journeys');
            expect(mockWhere).toHaveBeenCalledWith('category', '==', 'relationships');
            expect(res.json).toHaveBeenCalledWith({
                journeys: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'journey1',
                        title: '5 Love Languages',
                    }),
                ]),
            });
        });
        it('should return empty array for category with no journeys', async () => {
            req.params = { category: 'nonexistent' };
            mockGet.mockResolvedValueOnce({ docs: [] });
            await require('../journeys').default.getByCategory(req, res);
            expect(res.json).toHaveBeenCalledWith({ journeys: [] });
        });
    });
    describe('GET /journeys/popular', () => {
        const mockPopularJourneys = [
            {
                id: 'journey1',
                data: () => ({
                    title: '5 Love Languages',
                    completionCount: 100,
                }),
            },
        ];
        it('should return popular journeys', async () => {
            mockGet.mockResolvedValueOnce({ docs: mockPopularJourneys });
            await require('../journeys').default.getPopular(req, res);
            expect(mockCollection).toHaveBeenCalledWith('journeys');
            expect(mockOrderBy).toHaveBeenCalledWith('completionCount', 'desc');
            expect(mockLimit).toHaveBeenCalledWith(5);
            expect(res.json).toHaveBeenCalledWith({
                journeys: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'journey1',
                        title: '5 Love Languages',
                    }),
                ]),
            });
        });
        it('should handle errors when fetching popular journeys', async () => {
            const error = new Error('Database error');
            mockGet.mockRejectedValueOnce(error);
            await require('../journeys').default.getPopular(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Error fetching popular journeys',
            });
        });
    });
});
