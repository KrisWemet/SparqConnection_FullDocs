export interface ActivitySummary {
  title: string;
  description?: string;  // Optional field
  date: string;
  duration: number;
  id?: string;  // Adding optional id for database references
  userId?: string;  // Adding optional userId for ownership
  status?: 'completed' | 'in-progress' | 'planned';  // Adding status field
  tags?: string[];  // Adding optional tags for categorization
}

export interface Activity extends ActivitySummary {
  content: string;
  reflections?: string[];
  attachments?: string[];
  lastModified?: string;
  createdAt: string;
}

// Export activity-related enums and constants
export const ACTIVITY_STATUSES = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in-progress',
  PLANNED: 'planned',
} as const; 