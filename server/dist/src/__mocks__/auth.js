export const authenticateToken = jest.fn((req, res, next) => {
    req.user = {
        _id: 'user1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        isModerator: false,
        isAdmin: false,
        lastLogin: new Date(),
        role: 'user',
        fcmToken: undefined,
        notificationPreferences: {
            dailyPrompts: true,
            quizzes: true,
            achievements: true
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: async (candidatePassword) => true
    };
    next();
});
