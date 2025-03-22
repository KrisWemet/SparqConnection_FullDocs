import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { JourneyEventType } from '../utils/journeyLogger';

interface JourneyStats {
  totalJourneysStarted: number;
  totalJourneysCompleted: number;
  totalDaysCompleted: number;
  totalReflectionsSubmitted: number;
  averageReflectionLength: number;
  completionRate: number;
  userStats: {
    [userId: string]: {
      journeysStarted: number;
      journeysCompleted: number;
      daysCompleted: number;
      reflectionsSubmitted: number;
      totalReflectionLength: number;
      averageReflectionLength: number;
      lastActivity: Date;
    };
  };
  journeyStats: {
    [journeyId: string]: {
      starts: number;
      completions: number;
      daysCompleted: number;
      reflections: number;
      title?: string;
    };
  };
  timeOfDayStats: {
    [hour: string]: number;
  };
}

export async function analyzeJourneyLogs(daysBack: number = 30): Promise<JourneyStats> {
  const stats: JourneyStats = {
    totalJourneysStarted: 0,
    totalJourneysCompleted: 0,
    totalDaysCompleted: 0,
    totalReflectionsSubmitted: 0,
    averageReflectionLength: 0,
    completionRate: 0,
    userStats: {},
    journeyStats: {},
    timeOfDayStats: {},
  };

  const logDir = path.join(process.cwd(), 'logs');
  const currentDate = new Date();
  const oldestDate = new Date();
  oldestDate.setDate(currentDate.getDate() - daysBack);

  try {
    const files = await fs.promises.readdir(logDir);
    const journeyLogFiles = files.filter(file => 
      file.startsWith('journey-') && 
      file.endsWith('.log') &&
      new Date(file.slice(8, 18)) >= oldestDate
    );

    let totalReflectionLength = 0;

    for (const file of journeyLogFiles) {
      const fileStream = fs.createReadStream(path.join(logDir, file));
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        try {
          const logEntry = JSON.parse(line);
          const timestamp = new Date(logEntry.timestamp);
          const hour = timestamp.getHours().toString().padStart(2, '0');

          // Initialize user stats if not exists
          if (!stats.userStats[logEntry.userId]) {
            stats.userStats[logEntry.userId] = {
              journeysStarted: 0,
              journeysCompleted: 0,
              daysCompleted: 0,
              reflectionsSubmitted: 0,
              totalReflectionLength: 0,
              averageReflectionLength: 0,
              lastActivity: timestamp,
            };
          }

          // Initialize journey stats if not exists
          if (!stats.journeyStats[logEntry.journeyId]) {
            stats.journeyStats[logEntry.journeyId] = {
              starts: 0,
              completions: 0,
              daysCompleted: 0,
              reflections: 0,
              title: logEntry.metadata?.journeyTitle,
            };
          }

          // Update time of day stats
          stats.timeOfDayStats[hour] = (stats.timeOfDayStats[hour] || 0) + 1;

          // Update stats based on event type
          switch (logEntry.eventType) {
            case JourneyEventType.START:
              stats.totalJourneysStarted++;
              stats.userStats[logEntry.userId].journeysStarted++;
              stats.journeyStats[logEntry.journeyId].starts++;
              break;

            case JourneyEventType.DAY_COMPLETE:
              stats.totalDaysCompleted++;
              stats.userStats[logEntry.userId].daysCompleted++;
              stats.journeyStats[logEntry.journeyId].daysCompleted++;
              break;

            case JourneyEventType.REFLECTION_SUBMIT:
              stats.totalReflectionsSubmitted++;
              stats.userStats[logEntry.userId].reflectionsSubmitted++;
              stats.journeyStats[logEntry.journeyId].reflections++;
              totalReflectionLength += logEntry.reflectionLength || 0;
              stats.userStats[logEntry.userId].totalReflectionLength += logEntry.reflectionLength || 0;
              break;

            case JourneyEventType.JOURNEY_COMPLETE:
              stats.totalJourneysCompleted++;
              stats.userStats[logEntry.userId].journeysCompleted++;
              stats.journeyStats[logEntry.journeyId].completions++;
              break;
          }

          // Update last activity
          if (timestamp > stats.userStats[logEntry.userId].lastActivity) {
            stats.userStats[logEntry.userId].lastActivity = timestamp;
          }
        } catch (error) {
          console.error('Error processing log line:', error);
          continue;
        }
      }
    }

    // Calculate averages and rates
    stats.averageReflectionLength = totalReflectionLength / stats.totalReflectionsSubmitted || 0;
    stats.completionRate = (stats.totalJourneysCompleted / stats.totalJourneysStarted) * 100 || 0;

    // Calculate user averages
    Object.values(stats.userStats).forEach(userStat => {
      userStat.averageReflectionLength = 
        userStat.totalReflectionLength / userStat.reflectionsSubmitted || 0;
    });

    return stats;
  } catch (error) {
    console.error('Error analyzing journey logs:', error);
    throw error;
  }
}

// Function to generate a formatted report
export function generateReport(stats: JourneyStats): string {
  return `
Journey Analytics Report
=======================

Overall Statistics
----------------
Total Journeys Started: ${stats.totalJourneysStarted}
Total Journeys Completed: ${stats.totalJourneysCompleted}
Completion Rate: ${stats.completionRate.toFixed(2)}%
Total Days Completed: ${stats.totalDaysCompleted}
Total Reflections: ${stats.totalReflectionsSubmitted}
Average Reflection Length: ${stats.averageReflectionLength.toFixed(2)} characters

User Engagement
-------------
Total Active Users: ${Object.keys(stats.userStats).length}
Most Active Users (by days completed):
${Object.entries(stats.userStats)
  .sort((a, b) => b[1].daysCompleted - a[1].daysCompleted)
  .slice(0, 5)
  .map(([userId, stats]) => 
    `- User ${userId}: ${stats.daysCompleted} days, ${stats.journeysCompleted} journeys completed`
  ).join('\n')}

Journey Performance
----------------
${Object.entries(stats.journeyStats)
  .map(([journeyId, stats]) => 
    `${stats.title || journeyId}:
    - Started: ${stats.starts}
    - Completed: ${stats.completions}
    - Completion Rate: ${((stats.completions / stats.starts) * 100).toFixed(2)}%
    - Total Days Completed: ${stats.daysCompleted}
    - Total Reflections: ${stats.reflections}`
  ).join('\n\n')}

Time of Day Analysis
-----------------
Peak Activity Hours:
${Object.entries(stats.timeOfDayStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([hour, count]) => 
    `- ${hour}:00: ${count} events`
  ).join('\n')}
`;
}

// If running directly (not imported)
if (require.main === module) {
  const daysBack = process.argv[2] ? parseInt(process.argv[2]) : 30;
  analyzeJourneyLogs(daysBack)
    .then(stats => {
      console.log(generateReport(stats));
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
} 