# Support Documentation

## Overview
The Sparq Connection support system provides users with easy access to help resources through a floating help button and FAQ system. The system is designed to be intuitive, responsive, and easily maintainable.

## Help Button Component

### Features
1. **Floating Button**
   - Customizable position (bottom-right, bottom-left, top-right, top-left)
   - Smooth animations using Framer Motion
   - Accessible with ARIA labels

2. **FAQ Modal**
   - Search functionality
   - Category filtering
   - Tag-based organization
   - Responsive design
   - Keyboard navigation support

3. **Analytics Integration**
   - Tracks help button interactions
   - Monitors FAQ views
   - Records search queries

### Usage
```typescript
import { HelpButton } from '../components/HelpButton';

// Basic usage
<HelpButton />

// Custom position
<HelpButton position="bottom-left" />
```

## FAQ System

### Data Model
```typescript
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Get All FAQs
```typescript
GET /api/faq
Query Parameters:
- category (optional): Filter by category

Response:
{
  "faqs": FAQ[]
}
```

#### Get FAQ by ID
```typescript
GET /api/faq/:id

Response:
{
  "faq": FAQ
}
```

#### Create/Update FAQ (Admin Only)
```typescript
POST /api/faq
Authorization: Bearer <token>

Request Body:
{
  "id": string, // Optional for creation
  "question": string,
  "answer": string,
  "category": string,
  "tags": string[],
  "order": number,
  "isPublished": boolean
}
```

#### Delete FAQ (Admin Only)
```typescript
DELETE /api/faq/:id
Authorization: Bearer <token>
```

### Categories
1. **Getting Started**
   - Account setup
   - Partner invitations
   - Basic navigation

2. **Journey Features**
   - Starting a journey
   - Completing activities
   - Syncing with partner

3. **Technical Support**
   - Connection issues
   - App performance
   - Device compatibility

4. **Privacy & Security**
   - Data protection
   - Account security
   - Privacy settings

5. **Billing & Subscription**
   - Payment methods
   - Subscription management
   - Premium features

### Caching
- FAQ data is cached for 5 minutes
- Cache is automatically invalidated on updates
- Separate cache keys for:
  - All FAQs
  - Category-specific FAQs
  - Individual FAQ entries

## Implementation

### Frontend Integration
1. **Component Setup**
```typescript
// Add to App.tsx or layout component
import { HelpButton } from './components/HelpButton';

function App() {
  return (
    <>
      {/* Other components */}
      <HelpButton />
    </>
  );
}
```

2. **Styling**
- Uses Tailwind CSS for responsive design
- Custom animations with Framer Motion
- Dark mode support
- Mobile-first approach

### Backend Setup
1. **Firebase Configuration**
```typescript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /faqs/{faqId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

2. **Cache Configuration**
```typescript
// Redis cache settings
const cacheOptions = {
  ttl: 300, // 5 minutes
  prefix: 'faq:',
};
```

## Testing

### Component Tests
```typescript
describe('HelpButton', () => {
  it('should render help button', () => {
    render(<HelpButton />);
    expect(screen.getByLabelText('Open help')).toBeInTheDocument();
  });

  it('should open FAQ modal on click', async () => {
    render(<HelpButton />);
    fireEvent.click(screen.getByLabelText('Open help'));
    expect(await screen.findByText('Help Center')).toBeInTheDocument();
  });

  it('should filter FAQs on search', async () => {
    render(<HelpButton />);
    fireEvent.click(screen.getByLabelText('Open help'));
    const searchInput = await screen.findByPlaceholderText('Search FAQs...');
    fireEvent.change(searchInput, { target: { value: 'partner' } });
    expect(screen.getByText('No FAQs found matching your search')).toBeInTheDocument();
  });
});
```

### API Tests
```typescript
describe('FAQ API', () => {
  it('should fetch FAQs', async () => {
    const response = await request(app).get('/api/faq');
    expect(response.status).toBe(200);
    expect(response.body.faqs).toBeDefined();
  });

  it('should require admin for creating FAQ', async () => {
    const response = await request(app)
      .post('/api/faq')
      .send({
        question: 'Test FAQ',
        answer: 'Test answer',
      });
    expect(response.status).toBe(401);
  });
});
```

## Maintenance

### Regular Tasks
1. **Content Updates**
   - Review and update FAQ content
   - Add new categories as needed
   - Update outdated information

2. **Performance Monitoring**
   - Track help button usage
   - Monitor search patterns
   - Analyze FAQ effectiveness

3. **Cache Management**
   - Monitor cache hit rates
   - Adjust TTL if needed
   - Clear cache when necessary

### Best Practices
1. **Content Guidelines**
   - Keep answers concise and clear
   - Use consistent terminology
   - Include relevant examples
   - Update regularly

2. **Performance**
   - Optimize images and assets
   - Minimize bundle size
   - Use efficient search algorithms
   - Implement proper caching

3. **Accessibility**
   - Maintain WCAG compliance
   - Support keyboard navigation
   - Provide proper ARIA labels
   - Ensure color contrast

## Future Enhancements

### Planned Features
1. **AI-Powered Search**
   - Natural language processing
   - Smart suggestions
   - Auto-complete

2. **Interactive Guides**
   - Step-by-step tutorials
   - Video demonstrations
   - Interactive walkthroughs

3. **Community Support**
   - User forums
   - Knowledge base
   - Community contributions

4. **Support Chat**
   - Live chat integration
   - Chatbot assistance
   - Ticket system

### Technical Improvements
1. **Performance**
   - Elasticsearch integration
   - Advanced caching strategies
   - Bundle optimization

2. **Analytics**
   - Enhanced tracking
   - User behavior analysis
   - Support metrics dashboard

3. **Integration**
   - Help desk software
   - CRM systems
   - Documentation tools 