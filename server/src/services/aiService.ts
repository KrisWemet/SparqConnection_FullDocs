import * as tf from '@tensorflow/tfjs';
import { IUser } from '../models/User';
import { IPromptResponse } from '../models/PromptResponse';
import { IQuizResult } from '../models/QuizResult';

interface UserFeatures {
  averageScore: number;
  responseFrequency: number;
  topicPreferences: { [key: string]: number };
  engagementLevel: number;
}

export class AIPersonalizationService {
  private model: tf.Sequential | null = null;

  async initialize(): Promise<void> {
    // Create a simple neural network
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [6], units: 12, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'softmax' })
      ]
    });

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  private async extractUserFeatures(
    user: IUser,
    promptResponses: IPromptResponse[],
    quizResults: IQuizResult[]
  ): Promise<UserFeatures> {
    // Calculate average quiz score
    const averageScore = quizResults.length > 0
      ? quizResults.reduce((acc, result) => acc + result.score, 0) / quizResults.length
      : 0;

    // Calculate response frequency (responses per day)
    const firstResponse = promptResponses[0]?.createdAt || new Date();
    const daysSinceFirst = Math.max(1, (Date.now() - firstResponse.getTime()) / (1000 * 60 * 60 * 24));
    const responseFrequency = promptResponses.length / daysSinceFirst;

    // Calculate topic preferences
    const topicPreferences: { [key: string]: number } = {};
    promptResponses.forEach(response => {
      if (response.prompt.topic) {
        topicPreferences[response.prompt.topic] = (topicPreferences[response.prompt.topic] || 0) + 1;
      }
    });

    // Calculate engagement level (0-1)
    const engagementLevel = Math.min(
      1,
      (responseFrequency * 0.5) + (averageScore * 0.3) + (promptResponses.length > 0 ? 0.2 : 0)
    );

    return {
      averageScore,
      responseFrequency,
      topicPreferences,
      engagementLevel
    };
  }

  private preprocessFeatures(features: UserFeatures): tf.Tensor {
    // Convert features to a normalized tensor
    const featureArray = [
      features.averageScore / 100, // Normalize score to 0-1
      Math.min(1, features.responseFrequency / 5), // Cap at 5 responses per day
      Object.keys(features.topicPreferences).length / 10, // Normalize topic diversity
      features.engagementLevel,
      Math.max(...Object.values(features.topicPreferences)) / 10, // Normalize max topic preference
      Object.values(features.topicPreferences).reduce((a, b) => a + b, 0) / 100 // Normalize total responses
    ];

    return tf.tensor2d([featureArray]);
  }

  async getPersonalizedContent(
    user: IUser,
    promptResponses: IPromptResponse[],
    quizResults: IQuizResult[],
    availableContent: { prompts: any[]; quizzes: any[] }
  ) {
    if (!this.model) {
      await this.initialize();
    }

    const features = await this.extractUserFeatures(user, promptResponses, quizResults);
    const inputTensor = this.preprocessFeatures(features);

    // Get model predictions
    if (!this.model) {
      throw new Error('Model initialization failed');
    }
    
    const predictions = this.model.predict(inputTensor) as tf.Tensor;
    const contentTypeScores = await predictions.array() as number[][];

    // Clean up tensors
    inputTensor.dispose();
    predictions.dispose();

    // Select content based on predictions and user preferences
    const recommendedContent = {
      prompts: this.selectRecommendedPrompts(availableContent.prompts, features, contentTypeScores[0]),
      quizzes: this.selectRecommendedQuizzes(availableContent.quizzes, features, contentTypeScores[0])
    };

    return {
      recommendations: recommendedContent,
      userInsights: {
        engagementLevel: features.engagementLevel,
        topicPreferences: features.topicPreferences,
        suggestedTopics: this.getSuggestedTopics(features)
      }
    };
  }

  private selectRecommendedPrompts(prompts: any[], features: UserFeatures, scores: number[]): any[] {
    return prompts
      .map(prompt => ({
        ...prompt,
        score: this.calculateContentScore(prompt, features, scores)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ score, ...prompt }) => prompt);
  }

  private selectRecommendedQuizzes(quizzes: any[], features: UserFeatures, scores: number[]): any[] {
    return quizzes
      .map(quiz => ({
        ...quiz,
        score: this.calculateContentScore(quiz, features, scores)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, ...quiz }) => quiz);
  }

  private calculateContentScore(content: any, features: UserFeatures, modelScores: number[]): number {
    const topicScore = content.topic && features.topicPreferences[content.topic]
      ? features.topicPreferences[content.topic] / Math.max(...Object.values(features.topicPreferences))
      : 0.5;

    const difficultyScore = content.difficulty
      ? 1 - Math.abs(features.averageScore / 100 - content.difficulty / 100)
      : 0.5;

    const categoryWeight = content.type === 'prompt' ? modelScores[0] : modelScores[1];

    return (topicScore * 0.4) + (difficultyScore * 0.3) + (categoryWeight * 0.3);
  }

  private getSuggestedTopics(features: UserFeatures): string[] {
    const lowEngagementTopics = Object.entries(features.topicPreferences)
      .filter(([_, count]) => count < 3)
      .map(([topic, _]) => topic);

    return lowEngagementTopics.length > 0
      ? lowEngagementTopics.slice(0, 3)
      : Object.keys(features.topicPreferences).slice(0, 3);
  }
} 