import { Deadline, Priority } from '../models/deadline.interface';

export class StorageValidator {
  static validateDeadline(deadline: any): deadline is Deadline {
    return (
      typeof deadline === 'object' &&
      deadline !== null &&
      typeof deadline.id === 'number' &&
      typeof deadline.title === 'string' &&
      deadline.title.length > 0 &&
      deadline.dueDate instanceof Date &&
      Object.values(Priority).includes(deadline.priority) &&
      (deadline.description === undefined || typeof deadline.description === 'string') &&
      typeof deadline.daysRemaining === 'number'
    );
  }

  static validateDeadlines(data: any): data is Deadline[] {
    return (
      Array.isArray(data) &&
      data.every(item => this.validateDeadline(item))
    );
  }

  static sanitizeDeadline(deadline: any): Deadline | null {
    try {
      return {
        id: Number(deadline.id),
        title: String(deadline.title),
        dueDate: new Date(deadline.dueDate),
        priority: deadline.priority as Priority,
        description: deadline.description ? String(deadline.description) : undefined,
        daysRemaining: Number(deadline.daysRemaining)
      };
    } catch {
      return null;
    }
  }
} 