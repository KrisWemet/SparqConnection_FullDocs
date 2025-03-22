import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { AnalyticsEventType } from '../utils/analyticsLogger';

interface AnalyticsResult {
  journeyStats: {
    [journeyId: string]: JourneyStats;
  };
  activityStats: {
    [activityId: string]: ActivityStats;
  };
  globalStats: GlobalStats;
  timeRangeStats: TimeRangeStats;
}

interface JourneyStats {
  title: string;
  startCount: number;
  completionCount: number;
  averageDuration: number;
  completionRate: number;
  totalUsers: Set<string>;
  dayCompletions: { [day: number]: number };
}

interface ActivityStats {
  title: string;
  totalAttempts: number;
  completions: number;
  skips: number;
  averageDuration: number;
  completionRate: number;
  skipReasons: { [reason: string]: number };
  successRates: {
    success: number;
    partial: number;
    failed: number;
  };
}

interface GlobalStats {
  totalUsers: Set<string>;
  totalJourneyStarts: number;
  totalJourneyCompletions: number;
  totalActivitiesCompleted: number;
  totalActivitiesSkipped: number;
  averageJourneyCompletionRate: number;
  averageActivityCompletionRate: number;
}

interface TimeRangeStats {
  dailyActivity: { [date: string]: number };
  weeklyActivity: { [week: string]: number };
  monthlyActivity: { [month: string]: number };
  peakActivityHours: { [hour: number]: number };
}

export async function analyzeAnalytics(
  startDate?: Date,
  endDate?: Date,
  specificJourneyId?: string
): Promise<AnalyticsResult> {
  const logDir = path.join(process.cwd(), 'logs', 'analytics');
  const logFile = path.join(logDir, 'analytics.log');

  const result: AnalyticsResult = {
    journeyStats: {},
    activityStats: {},
    globalStats: {
      totalUsers: new Set(),
      totalJourneyStarts: 0,
      totalJourneyCompletions: 0,
      totalActivitiesCompleted: 0,
      totalActivitiesSkipped: 0,
      averageJourneyCompletionRate: 0,
      averageActivityCompletionRate: 0,
    },
    timeRangeStats: {
      dailyActivity: {},
      weeklyActivity: {},
      monthlyActivity: {},
      peakActivityHours: {},
    },
  };

  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    try {
      const logEntry = JSON.parse(line);
      const timestamp = new Date(logEntry.timestamp);

      // Apply date filters if provided
      if (startDate && timestamp < startDate) continue;
      if (endDate && timestamp > endDate) continue;

      // Apply journey filter if provided
      if (specificJourneyId && logEntry.metadata?.journeyId !== specificJourneyId) continue;

      updateTimeRangeStats(result.timeRangeStats, timestamp);

      switch (logEntry.metadata?.eventType) {
        case AnalyticsEventType.JOURNEY_START:
          handleJourneyStart(result, logEntry);
          break;
        case AnalyticsEventType.DAY_COMPLETE:
          handleDayComplete(result, logEntry);
          break;
        case AnalyticsEventType.ACTIVITY_COMPLETE:
          handleActivityComplete(result, logEntry);
          break;
        case AnalyticsEventType.SKIPPED_ACTIVITY:
          handleSkippedActivity(result, logEntry);
          break;
      }
    } catch (error) {
      console.error('Error processing log entry:', error);
      continue;
    }
  }

  // Calculate final statistics
  calculateFinalStats(result);

  return result;
}

function updateTimeRangeStats(stats: TimeRangeStats, timestamp: Date): void {
  const dateStr = timestamp.toISOString().split('T')[0];
  const weekStr = getWeekNumber(timestamp);
  const monthStr = timestamp.toISOString().slice(0, 7);
  const hour = timestamp.getHours();

  stats.dailyActivity[dateStr] = (stats.dailyActivity[dateStr] || 0) + 1;
  stats.weeklyActivity[weekStr] = (stats.weeklyActivity[weekStr] || 0) + 1;
  stats.monthlyActivity[monthStr] = (stats.monthlyActivity[monthStr] || 0) + 1;
  stats.peakActivityHours[hour] = (stats.peakActivityHours[hour] || 0) + 1;
}

function handleJourneyStart(result: AnalyticsResult, logEntry: any): void {
  const { journeyId, journeyTitle, userId } = logEntry.metadata;
  result.globalStats.totalUsers.add(userId);
  result.globalStats.totalJourneyStarts++;

  if (!result.journeyStats[journeyId]) {
    result.journeyStats[journeyId] = {
      title: journeyTitle,
      startCount: 0,
      completionCount: 0,
      averageDuration: 0,
      completionRate: 0,
      totalUsers: new Set(),
      dayCompletions: {},
    };
  }

  result.journeyStats[journeyId].startCount++;
  result.journeyStats[journeyId].totalUsers.add(userId);
}

function handleDayComplete(result: AnalyticsResult, logEntry: any): void {
  const { journeyId, dayNumber } = logEntry.metadata;
  
  if (result.journeyStats[journeyId]) {
    result.journeyStats[journeyId].dayCompletions[dayNumber] = 
      (result.journeyStats[journeyId].dayCompletions[dayNumber] || 0) + 1;
  }
}

function handleActivityComplete(result: AnalyticsResult, logEntry: any): void {
  const { activityId, activityTitle, duration, completionStatus } = logEntry.metadata;
  result.globalStats.totalActivitiesCompleted++;

  if (!result.activityStats[activityId]) {
    result.activityStats[activityId] = {
      title: activityTitle,
      totalAttempts: 0,
      completions: 0,
      skips: 0,
      averageDuration: 0,
      completionRate: 0,
      skipReasons: {},
      successRates: { success: 0, partial: 0, failed: 0 },
    };
  }

  const stats = result.activityStats[activityId];
  stats.totalAttempts++;
  stats.completions++;
  
  if (duration) {
    stats.averageDuration = 
      (stats.averageDuration * (stats.completions - 1) + duration) / stats.completions;
  }

  if (completionStatus) {
    stats.successRates[completionStatus as keyof typeof stats.successRates]++;
  }
}

function handleSkippedActivity(result: AnalyticsResult, logEntry: any): void {
  const { activityId, activityTitle, reason } = logEntry.metadata;
  result.globalStats.totalActivitiesSkipped++;

  if (!result.activityStats[activityId]) {
    result.activityStats[activityId] = {
      title: activityTitle,
      totalAttempts: 0,
      completions: 0,
      skips: 0,
      averageDuration: 0,
      completionRate: 0,
      skipReasons: {},
      successRates: { success: 0, partial: 0, failed: 0 },
    };
  }

  const stats = result.activityStats[activityId];
  stats.totalAttempts++;
  stats.skips++;
  
  if (reason) {
    stats.skipReasons[reason] = (stats.skipReasons[reason] || 0) + 1;
  }
}

function calculateFinalStats(result: AnalyticsResult): void {
  // Calculate journey completion rates
  Object.values(result.journeyStats).forEach(stats => {
    stats.completionRate = stats.completionCount / stats.startCount || 0;
  });

  // Calculate activity completion rates
  Object.values(result.activityStats).forEach(stats => {
    stats.completionRate = stats.completions / stats.totalAttempts || 0;
  });

  // Calculate global averages
  const journeyRates = Object.values(result.journeyStats).map(s => s.completionRate);
  const activityRates = Object.values(result.activityStats).map(s => s.completionRate);

  result.globalStats.averageJourneyCompletionRate = 
    journeyRates.reduce((a, b) => a + b, 0) / journeyRates.length || 0;
  result.globalStats.averageActivityCompletionRate = 
    activityRates.reduce((a, b) => a + b, 0) / activityRates.length || 0;
}

function getWeekNumber(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

export function generateAnalyticsReport(results: AnalyticsResult): string {
  let report = '# Sparq Connection Analytics Report\n\n';

  // Global Statistics
  report += '## Global Statistics\n';
  report += `- Total Users: ${results.globalStats.totalUsers.size}\n`;
  report += `- Total Journey Starts: ${results.globalStats.totalJourneyStarts}\n`;
  report += `- Total Journey Completions: ${results.globalStats.totalJourneyCompletions}\n`;
  report += `- Average Journey Completion Rate: ${(results.globalStats.averageJourneyCompletionRate * 100).toFixed(2)}%\n`;
  report += `- Total Activities Completed: ${results.globalStats.totalActivitiesCompleted}\n`;
  report += `- Total Activities Skipped: ${results.globalStats.totalActivitiesSkipped}\n`;
  report += `- Average Activity Completion Rate: ${(results.globalStats.averageActivityCompletionRate * 100).toFixed(2)}%\n\n`;

  // Journey Statistics
  report += '## Journey Statistics\n';
  Object.entries(results.journeyStats).forEach(([journeyId, stats]) => {
    report += `\n### ${stats.title} (${journeyId})\n`;
    report += `- Start Count: ${stats.startCount}\n`;
    report += `- Completion Count: ${stats.completionCount}\n`;
    report += `- Completion Rate: ${(stats.completionRate * 100).toFixed(2)}%\n`;
    report += `- Average Duration: ${stats.averageDuration.toFixed(2)} days\n`;
    report += `- Total Unique Users: ${stats.totalUsers.size}\n`;
  });

  // Activity Statistics
  report += '\n## Activity Statistics\n';
  Object.entries(results.activityStats).forEach(([activityId, stats]) => {
    report += `\n### ${stats.title} (${activityId})\n`;
    report += `- Total Attempts: ${stats.totalAttempts}\n`;
    report += `- Completions: ${stats.completions}\n`;
    report += `- Skips: ${stats.skips}\n`;
    report += `- Completion Rate: ${(stats.completionRate * 100).toFixed(2)}%\n`;
    report += `- Average Duration: ${stats.averageDuration.toFixed(2)} minutes\n`;
    
    if (Object.keys(stats.skipReasons).length > 0) {
      report += '- Skip Reasons:\n';
      Object.entries(stats.skipReasons).forEach(([reason, count]) => {
        report += `  - ${reason}: ${count}\n`;
      });
    }
  });

  // Time-based Analysis
  report += '\n## Time-based Analysis\n';
  
  // Peak Activity Hours
  const peakHours = Object.entries(results.timeRangeStats.peakActivityHours)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  report += '\n### Peak Activity Hours\n';
  peakHours.forEach(([hour, count]) => {
    report += `- ${hour}:00: ${count} events\n`;
  });

  return report;
}

// Export types for external use
export type {
  AnalyticsResult,
  JourneyStats,
  ActivityStats,
  GlobalStats,
  TimeRangeStats,
}; 