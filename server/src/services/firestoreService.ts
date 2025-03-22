import { db } from '../config/firebase';
import { Timestamp, DocumentData, FieldValue } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';

interface IPrompt {
  prompt_id?: string;  // Optional since it will be set from the document ID
  prompt_text: string;
  category: string;
  date: string;
  active: boolean;
}

interface IQuiz {
  id?: string;  // Optional since it will be set from the document ID
  title: string;
  description: string;
  category: string;
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      score: number;
    }>;
  }>;
  active: boolean;
}

interface IExpertAdvice {
  id?: string;  // Optional since it will be set from the document ID
  title: string;
  content: any[];
  points_required: number;
  category: string;
  expert: {
    name: string;
    credentials: string;
    avatar?: string;
  };
  publishedAt: string;
}

export interface IUser {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isModerator: boolean;
  isAdmin: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  role: 'user' | 'admin';
  stripeCustomerId?: string;
  fcmToken?: string;
  notificationPreferences: {
    dailyPrompts: boolean;
    quizzes: boolean;
    achievements: boolean;
  };
  subscription?: {
    status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
    planId: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
}

export interface IGamification {
  id?: string;
  userId: string;
  points: number;
  current_streak: number;
  longest_streak: number;
  total_quizzes_completed: number;
  perfect_scores: number;
  daily_responses: number;
  points_history: Array<{
    date: Date;
    points: number;
    source: 'prompt_response' | 'quiz_completion' | 'streak_bonus' | 'badge_earned';
  }>;
  streak_history: Array<{
    date: Date;
    streak: number;
  }>;
  badges: Array<{
    type: string;
    name: string;
    description: string;
    icon: string;
    earned_at: Date;
  }>;
  last_activity: Date;
  quiz_categories_completed: string[];
  mood_entries: number;
}

export interface IPromptResponse {
  id?: string;
  userId: string;
  promptId: string;
  response: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizResponse {
  id?: string;
  userId: string;
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    score: number;
  }>;
  totalScore: number;
  completedAt: Date;
}

export interface IForumPost {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  category: 'General' | 'Advice' | 'Success Stories' | 'Support' | 'Events';
  tags: string[];
  likes: string[];
  isModerated: boolean;
  isFlagged: boolean;
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IForumComment {
  id?: string;
  postId: string;
  content: string;
  authorId: string;
  likes: string[];
  isModerated: boolean;
  isFlagged: boolean;
  moderationNotes?: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const promptService = {
  async getTodayPrompt(): Promise<IPrompt | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const promptsRef = db.collection('prompts');
    const query = await promptsRef
      .where('date', '==', todayStr)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (query.empty) {
      // If no prompt for today, get a random active prompt
      const allPromptsQuery = await promptsRef
        .where('active', '==', true)
        .get();

      if (allPromptsQuery.empty) return null;

      const prompts = allPromptsQuery.docs;
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      const promptData = randomPrompt.data() as IPrompt;
      return {
        ...promptData,
        prompt_id: randomPrompt.id
      };
    }

    const prompt = query.docs[0];
    const promptData = prompt.data() as IPrompt;
    return {
      ...promptData,
      prompt_id: prompt.id
    };
  }
};

export const quizService = {
  async getAllQuizzes(): Promise<IQuiz[]> {
    const quizzesRef = db.collection('quizzes');
    const query = await quizzesRef
      .where('active', '==', true)
      .get();

    return query.docs.map(doc => ({
      ...doc.data() as IQuiz,
      id: doc.id
    }));
  },

  async getQuizById(id: string): Promise<IQuiz | null> {
    const quizDoc = await db.collection('quizzes').doc(id).get();
    
    if (!quizDoc.exists) return null;

    return {
      ...quizDoc.data() as IQuiz,
      id: quizDoc.id
    };
  }
};

export const expertAdviceService = {
  async getAllExpertAdvice(): Promise<IExpertAdvice[]> {
    const adviceRef = db.collection('expertAdvice');
    const query = await adviceRef
      .orderBy('points_required', 'asc')
      .get();

    return query.docs.map(doc => ({
      ...doc.data() as IExpertAdvice,
      id: doc.id
    }));
  },

  async getExpertAdviceById(id: string): Promise<IExpertAdvice | null> {
    const adviceDoc = await db.collection('expertAdvice').doc(id).get();
    
    if (!adviceDoc.exists) return null;

    return {
      ...adviceDoc.data() as IExpertAdvice,
      id: adviceDoc.id
    };
  }
};

export const userService = {
  async createUser(userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const now = new Date();
    
    const userDoc = await db.collection('users').add({
      ...userData,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    });

    return {
      id: userDoc.id,
      ...userData,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    };
  },

  async getUserById(id: string): Promise<IUser | null> {
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) return null;
    return { id: userDoc.id, ...userDoc.data() as IUser };
  },

  async getUserByEmail(email: string): Promise<IUser | null> {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
    
    if (snapshot.empty) return null;
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() as IUser };
  },

  async comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, user.password);
  },

  async updateUser(id: string, updateData: Partial<IUser>): Promise<void> {
    const userRef = db.collection('users').doc(id);
    await userRef.update({
      ...updateData,
      updatedAt: new Date()
    });
  }
};

export const gamificationService = {
  async getGamification(userId: string): Promise<IGamification | null> {
    const gamificationDoc = await db.collection('gamification').doc(userId).get();
    if (!gamificationDoc.exists) return null;
    return { id: gamificationDoc.id, ...gamificationDoc.data() as IGamification };
  },

  async updateGamification(userId: string, updateData: Partial<IGamification>): Promise<void> {
    const gamificationRef = db.collection('gamification').doc(userId);
    await gamificationRef.update({
      ...updateData,
      updatedAt: new Date()
    });
  },

  async addPoints(userId: string, points: number, source: IGamification['points_history'][0]['source']): Promise<void> {
    const gamificationRef = db.collection('gamification').doc(userId);
    await gamificationRef.update({
      points: FieldValue.increment(points),
      points_history: FieldValue.arrayUnion({
        date: new Date(),
        points,
        source
      })
    });
  }
};

export const forumService = {
  async createPost(postData: Omit<IForumPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<IForumPost> {
    const now = new Date();
    const postDoc = await db.collection('forumPosts').add({
      ...postData,
      createdAt: now,
      updatedAt: now
    });

    return {
      id: postDoc.id,
      ...postData,
      createdAt: now,
      updatedAt: now
    };
  },

  async getPost(id: string): Promise<IForumPost | null> {
    const postDoc = await db.collection('forumPosts').doc(id).get();
    if (!postDoc.exists) return null;
    return { id: postDoc.id, ...postDoc.data() as IForumPost };
  },

  async createComment(commentData: Omit<IForumComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<IForumComment> {
    const now = new Date();
    const commentDoc = await db.collection('forumComments').add({
      ...commentData,
      createdAt: now,
      updatedAt: now
    });

    return {
      id: commentDoc.id,
      ...commentData,
      createdAt: now,
      updatedAt: now
    };
  },

  async getPostComments(postId: string): Promise<IForumComment[]> {
    const commentsSnapshot = await db.collection('forumComments')
      .where('postId', '==', postId)
      .orderBy('createdAt', 'asc')
      .get();

    return commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as IForumComment
    }));
  }
};

export const responseService = {
  async createPromptResponse(responseData: Omit<IPromptResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<IPromptResponse> {
    const now = new Date();
    const responseDoc = await db.collection('promptResponses').add({
      ...responseData,
      createdAt: now,
      updatedAt: now
    });

    return {
      id: responseDoc.id,
      ...responseData,
      createdAt: now,
      updatedAt: now
    };
  },

  async createQuizResponse(responseData: Omit<IQuizResponse, 'id'>): Promise<IQuizResponse> {
    const responseDoc = await db.collection('quizResponses').add(responseData);

    return {
      id: responseDoc.id,
      ...responseData
    };
  },

  async getUserPromptResponses(userId: string): Promise<IPromptResponse[]> {
    const responsesSnapshot = await db.collection('promptResponses')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return responsesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as IPromptResponse
    }));
  },

  async getUserQuizResponses(userId: string): Promise<IQuizResponse[]> {
    const responsesSnapshot = await db.collection('quizResponses')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .get();

    return responsesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as IQuizResponse
    }));
  }
}; 