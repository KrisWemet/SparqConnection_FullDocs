import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';

interface UserPreferences {
  userId: string;
  topicPreferences: {
    [key: string]: number; // topic -> engagement score (0-1)
  };
  difficultyLevel: number; // 1-5
  responseFrequency: number; // average responses per week
  lastTopics: string[]; // last 5 topics to avoid repetition
  updatedAt: Date;
}

interface ContentItem {
  id: string;
  type: 'prompt' | 'quiz';
  topic: string;
  difficulty: number;
  title: string;
  content: string;
  category: string;
}

interface PromptResponse {
  userId: string;
  promptId: string;
  response: string;
  sentiment: string;
  createdAt: Timestamp | Date;
}

interface QuizResponse {
  userId: string;
  quizId: string;
  totalScore: number;
  completedAt: Timestamp | Date;
}

interface Prompt {
  id: string;
  topic: string;
  content: string;
  difficulty: number;
  title: string;
  category: string;
}

interface Quiz {
  id: string;
  topic: string;
  content: string;
  difficulty: number;
  title: string;
  category: string;
  score?: number;
}

interface GamificationData {
  userId: string;
  points: number;
  daily_responses: number;
  current_streak: number;
  longest_streak: number;
  badges: string[];
  level: number;
  xp: number;
}

export class PersonalizationService {
  private async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const prefsDoc = await db.collection('userPreferences').doc(userId).get();
      return prefsDoc.exists ? prefsDoc.data() as UserPreferences : null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  private async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<void> {
    try {
      await db.collection('userPreferences').doc(userId).set({
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  private async calculateTopicPreferences(userId: string): Promise<{ [key: string]: number }> {
    const topicPreferences: { [key: string]: number } = {};
    
    try {
      // Analyze prompt responses
      const promptResponses = await db.collection('promptResponses')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const promptResponsesData = promptResponses.docs.map(doc => 
        doc.data() as PromptResponse
      );

      // Get prompt data for each response
      const prompts = await Promise.all(
        promptResponsesData.map(async (response) => {
          const promptDoc = await db.collection('prompts').doc(response.promptId).get();
          return promptDoc.exists ? promptDoc.data() as Prompt : null;
        })
      );

      // Count topic occurrences
      const topicCounts: { [key: string]: number } = {};
      let totalResponses = 0;

      prompts.forEach(prompt => {
        if (prompt?.topic) {
          topicCounts[prompt.topic] = (topicCounts[prompt.topic] || 0) + 1;
          totalResponses++;
        }
      });

      // Calculate engagement scores (0-1)
      Object.entries(topicCounts).forEach(([topic, count]) => {
        topicPreferences[topic] = count / totalResponses;
      });

      // Add quiz performance data
      const quizResponses = await db.collection('quizResponses')
        .where('userId', '==', userId)
        .orderBy('completedAt', 'desc')
        .limit(20)
        .get();

      const quizResponsesData = quizResponses.docs.map(doc => 
        doc.data() as QuizResponse
      );

      // Get quiz data for each response
      const quizzes = await Promise.all(
        quizResponsesData.map(async (response) => {
          const quizDoc = await db.collection('quizzes').doc(response.quizId).get();
          if (!quizDoc.exists) return null;
          
          const quizData = quizDoc.data() as Quiz;
          return { 
            ...quizData, 
            score: response.totalScore 
          };
        })
      );

      // Adjust preferences based on quiz performance
      quizzes.forEach(quiz => {
        if (quiz?.topic && quiz?.score !== undefined) {
          const performanceBonus = (quiz.score / 100) * 0.2; // Up to 0.2 bonus for perfect scores
          topicPreferences[quiz.topic] = (topicPreferences[quiz.topic] || 0) + performanceBonus;
        }
      });

    } catch (error) {
      console.error('Error calculating topic preferences:', error);
    }

    return topicPreferences;
  }

  private calculateDifficultyLevel(
    promptResponses: number,
    quizScores: number[],
    currentStreak: number
  ): number {
    // Base difficulty on quiz performance and engagement
    const avgQuizScore = quizScores.length > 0 
      ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length 
      : 0;
    
    const baseLevel = Math.ceil((avgQuizScore / 100) * 5);
    
    // Adjust for engagement
    const engagementBonus = Math.min(promptResponses / 20, 1); // Cap at 20 responses
    const streakBonus = Math.min(currentStreak / 7, 1); // Cap at 7-day streak
    
    const adjustedLevel = baseLevel + (engagementBonus + streakBonus) / 2;
    
    // Ensure difficulty is between 1-5
    return Math.max(1, Math.min(5, Math.round(adjustedLevel)));
  }

  public async getPersonalizedContent(
    userId: string,
    contentType: 'prompt' | 'quiz' | 'both'
  ): Promise<ContentItem[]> {
    try {
      // Get or initialize user preferences
      let prefs = await this.getUserPreferences(userId);
      
      if (!prefs) {
        const topicPreferences = await this.calculateTopicPreferences(userId);
        
        // Get user's quiz scores
        const quizResponses = await db.collection('quizResponses')
          .where('userId', '==', userId)
          .orderBy('completedAt', 'desc')
          .limit(10)
          .get();
        
        const quizResponsesData = quizResponses.docs.map(doc => 
          doc.data() as QuizResponse
        );
        
        const scores = quizResponsesData.map(response => response.totalScore);
        
        // Get user's gamification data
        const gamificationDoc = await db.collection('gamification').doc(userId).get();
        const gamificationData = gamificationDoc.exists 
          ? gamificationDoc.data() as GamificationData 
          : null;
        
        prefs = {
          userId,
          topicPreferences,
          difficultyLevel: this.calculateDifficultyLevel(
            gamificationData?.daily_responses || 0,
            scores,
            gamificationData?.current_streak || 0
          ),
          responseFrequency: gamificationData?.daily_responses || 0,
          lastTopics: [],
          updatedAt: new Date()
        };
        
        await this.updateUserPreferences(userId, prefs);
      }

      // Query content based on preferences
      const contentQueries: Promise<ContentItem[]>[] = [];
      
      if (contentType === 'prompt' || contentType === 'both') {
        contentQueries.push(this.getPersonalizedPrompts(prefs));
      }
      
      if (contentType === 'quiz' || contentType === 'both') {
        contentQueries.push(this.getPersonalizedQuizzes(prefs));
      }
      
      const results = await Promise.all(contentQueries);
      return results.flat();

    } catch (error) {
      console.error('Error getting personalized content:', error);
      return [];
    }
  }

  private async getPersonalizedPrompts(prefs: UserPreferences): Promise<ContentItem[]> {
    const topTopics = Object.entries(prefs.topicPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    // Ensure we have at least one topic, even if user preferences are empty
    const topics = topTopics.length > 0 ? topTopics : ['general'];

    const promptsQuery = db.collection('prompts')
      .where('difficulty', '<=', prefs.difficultyLevel)
      .where('topic', 'in', topics)
      .limit(5);

    const promptsSnapshot = await promptsQuery.get();
    
    return promptsSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'prompt' as const,
      ...doc.data()
    } as ContentItem));
  }

  private async getPersonalizedQuizzes(prefs: UserPreferences): Promise<ContentItem[]> {
    const topTopics = Object.entries(prefs.topicPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    // Ensure we have at least one topic, even if user preferences are empty
    const topics = topTopics.length > 0 ? topTopics : ['general'];

    const quizzesQuery = db.collection('quizzes')
      .where('difficulty', '<=', prefs.difficultyLevel)
      .where('topic', 'in', topics)
      .limit(3);

    const quizzesSnapshot = await quizzesQuery.get();
    
    return quizzesSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'quiz' as const,
      ...doc.data()
    } as ContentItem));
  }
}

export const personalizationService = new PersonalizationService(); 