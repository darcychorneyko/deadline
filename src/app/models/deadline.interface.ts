export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Deadline {
  id: number;           // Unique identifier for the deadline
  title: string;        // Task title
  dueDate: Date;        // Due date
  priority: Priority;   // Priority level
  description?: string; // Optional longer description
  daysRemaining: number; // Calculated from due date
}

// Type for creating a new deadline (without id and daysRemaining which are auto-generated)
export type CreateDeadlineDto = Omit<Deadline, 'id' | 'daysRemaining'>; 