# API Specification for Sparq Connection

## Authentication & User Management:
- **POST /auth/register**  
  - Input: `{ email, password, username }`  
  - Output: `{ user_id, token }`
- **POST /auth/login**  
  - Input: `{ email, password }`  
  - Output: `{ user_id, token }`
- **GET /auth/verify**  
  - Input: Header `Authorization: Bearer <token>`  
  - Output: `{ user_id, email, username }`

## Core API Endpoints:
- **GET /prompts/today**  
  - Output: `{ prompt_id, prompt_text }`
- **POST /prompts/response**  
  - Input: `{ prompt_id, response_text }`  
  - Output: `{ response_id }`
- **GET /analytics**  
  - Output: `{ interaction_frequency, quiz_scores, mood_trends }`
- **GET /calendar/events**  
  - Output: `{ event_id, title, date }`

## New Endpoints:
- **POST /ai/personalize**  
  - Input: `{ user_id, interaction_history }`  
  - Output: `{ tailored_prompt, recommended_activity }`  
- **POST /mood/log**  
  - Input: `{ user_id, mood_rating, note }`  
  - Output: `{ mood_id }`  
- **GET /gamification/status**  
  - Output: `{ user_id, points, streaks, badges }`  
- **POST /gamification/redeem**  
  - Input: `{ user_id, reward_id }`  
  - Output: `{ success: true, reward_details }`  

## Future Expansion:
- AI-driven content generation (e.g., Eleven Labs integration for voice-based prompts).  
- Real-time chat endpoints (e.g., `/chat/messages`).
