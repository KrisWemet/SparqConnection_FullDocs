import { db } from '../config/firebase';

export interface IQuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IQuiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

class QuizService {
  private collection = db.collection('quizzes');

  async createQuiz(quizData: Omit<IQuiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<IQuiz> {
    const now = new Date();
    
    const quizDoc = await this.collection.add({
      ...quizData,
      createdAt: now,
      updatedAt: now
    });

    return {
      id: quizDoc.id,
      ...quizData,
      createdAt: now,
      updatedAt: now
    };
  }

  async findById(id: string): Promise<IQuiz | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() as Omit<IQuiz, 'id'> };
  }

  async findAll(): Promise<IQuiz[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<IQuiz, 'id'> }));
  }

  async findByCategory(category: string): Promise<IQuiz[]> {
    const snapshot = await this.collection.where('category', '==', category).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<IQuiz, 'id'> }));
  }

  async updateQuiz(id: string, update: Partial<Omit<IQuiz, 'id' | 'createdAt'>>): Promise<void> {
    await this.collection.doc(id).update({
      ...update,
      updatedAt: new Date()
    });
  }

  async deleteQuiz(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}

export const quizService = new QuizService();

// Default export for use in import statements
export default quizService; 