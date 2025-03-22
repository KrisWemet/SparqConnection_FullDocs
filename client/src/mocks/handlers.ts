import { http, HttpResponse } from 'msw';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  token: 'mock-token'
};

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ user: mockUser });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({ user: mockUser });
  }),

  // User endpoints
  http.get('/api/user/profile', () => {
    return HttpResponse.json({ user: mockUser });
  }),

  // Journey endpoints
  http.get('/api/journey/current', () => {
    return HttpResponse.json({
      journey: {
        id: '1',
        title: 'Test Journey',
        currentDay: 1,
        totalDays: 5
      }
    });
  }),

  // Daily log endpoints
  http.get('/api/dailyLog/today', () => {
    return HttpResponse.json({
      exists: false,
      log: null
    }, { status: 200 });
  }),

  http.post('/api/dailyLog', () => {
    return HttpResponse.json({
      success: true,
      message: 'Daily log created successfully'
    }, { status: 201 });
  }),

  // Profile endpoints
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      id: mockUser.id,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
      photoURL: null,
      relationshipStatus: 'single',
      partnerEmail: null
    }, { status: 200 });
  }),

  // Fallback 404 handler
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  })
]; 