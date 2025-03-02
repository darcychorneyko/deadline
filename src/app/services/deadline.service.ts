import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, map, interval } from 'rxjs';
import { Deadline, CreateDeadlineDto } from '../models/deadline.interface';
import { StorageValidator } from './storage.validator';

const STORAGE_KEY = 'deadlines';
const BACKUP_KEY = 'deadlines_backup';
const UPDATE_INTERVAL = 60 * 60 * 1000; // Check every hour

@Injectable({
  providedIn: 'root'
})
export class DeadlineService implements OnDestroy {
  private deadlines = new BehaviorSubject<Deadline[]>([]);
  private currentId = 1;
  private lastUpdateDate = new Date().setHours(0, 0, 0, 0);
  private updateSubscription = interval(UPDATE_INTERVAL).subscribe(() => {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    if (currentDate > this.lastUpdateDate) {
      // Day has changed, update all deadlines
      this.lastUpdateDate = currentDate;
      const currentDeadlines = this.deadlines.getValue();
      const updatedDeadlines = this.updateDaysRemaining(currentDeadlines);
      this.deadlines.next(updatedDeadlines);
      this.saveToStorage(updatedDeadlines);
    }
  });

  constructor() {
    this.loadFromStorage();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  // Get all deadlines sorted by days remaining
  getDeadlines(): Observable<Deadline[]> {
    return this.deadlines.pipe(
      map(deadlines => {
        return this.updateDaysRemaining(deadlines).sort((a, b) => a.daysRemaining - b.daysRemaining);
      })
    );
  }

  // Add a new deadline
  addDeadline(deadlineDto: CreateDeadlineDto): void {
    const newDeadline: Deadline = {
      ...deadlineDto,
      id: this.generateId(),
      daysRemaining: this.calculateDaysRemaining(deadlineDto.dueDate)
    };

    if (!StorageValidator.validateDeadline(newDeadline)) {
      throw new Error('Invalid deadline data');
    }

    const currentDeadlines = this.deadlines.getValue();
    const updatedDeadlines = [...currentDeadlines, newDeadline];
    this.deadlines.next(updatedDeadlines);
    this.saveToStorage(updatedDeadlines);
  }

  // Delete a deadline
  deleteDeadline(id: number): void {
    const currentDeadlines = this.deadlines.getValue();
    const updatedDeadlines = currentDeadlines.filter(d => d.id !== id);
    this.deadlines.next(updatedDeadlines);
    this.saveToStorage(updatedDeadlines);
  }

  // Update a deadline
  updateDeadline(id: number, deadlineDto: CreateDeadlineDto): void {
    const updatedDeadline: Deadline = {
      ...deadlineDto,
      id,
      daysRemaining: this.calculateDaysRemaining(deadlineDto.dueDate)
    };

    if (!StorageValidator.validateDeadline(updatedDeadline)) {
      throw new Error('Invalid deadline data');
    }

    const currentDeadlines = this.deadlines.getValue();
    const updatedDeadlines = currentDeadlines.map(d => d.id === id ? updatedDeadline : d);
    this.deadlines.next(updatedDeadlines);
    this.saveToStorage(updatedDeadlines);
  }

  // Import deadlines from JSON
  importDeadlines(deadlines: any[]): void {
    const sanitizedDeadlines = deadlines
      .map(d => StorageValidator.sanitizeDeadline(d))
      .filter((d): d is Deadline => d !== null);

    if (sanitizedDeadlines.length === 0) {
      throw new Error('No valid deadlines found in import data');
    }

    const updatedDeadlines = this.updateDaysRemaining(sanitizedDeadlines);
    this.currentId = Math.max(...updatedDeadlines.map(d => d.id), 0) + 1;
    this.deadlines.next(updatedDeadlines);
    this.saveToStorage(updatedDeadlines);
  }

  // Export deadlines to JSON
  exportDeadlines(): Deadline[] {
    return this.deadlines.getValue();
  }

  // Clear all deadlines
  clearDeadlines(): void {
    // Create backup before clearing
    this.createBackup();
    this.deadlines.next([]);
    this.saveToStorage([]);
    this.currentId = 1;
  }

  // Restore from backup
  restoreFromBackup(): boolean {
    try {
      const backupData = localStorage.getItem(BACKUP_KEY);
      if (!backupData) return false;

      const deadlines: Deadline[] = JSON.parse(backupData);
      if (!StorageValidator.validateDeadlines(deadlines)) return false;

      this.deadlines.next(deadlines);
      this.saveToStorage(deadlines);
      return true;
    } catch {
      return false;
    }
  }

  private createBackup(): void {
    try {
      const currentData = JSON.stringify(this.deadlines.getValue());
      localStorage.setItem(BACKUP_KEY, currentData);
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  private generateId(): number {
    return this.currentId++;
  }

  private calculateDaysRemaining(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private updateDaysRemaining(deadlines: Deadline[]): Deadline[] {
    return deadlines.map(deadline => ({
      ...deadline,
      daysRemaining: this.calculateDaysRemaining(deadline.dueDate)
    }));
  }

  private saveToStorage(deadlines: Deadline[]): void {
    try {
      // Create backup before saving
      this.createBackup();
      
      const serializedData = JSON.stringify(deadlines);
      localStorage.setItem(STORAGE_KEY, serializedData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save deadlines');
    }
  }

  private loadFromStorage(): void {
    try {
      const serializedData = localStorage.getItem(STORAGE_KEY);
      if (!serializedData) {
        this.deadlines.next([]);
        return;
      }

      const parsedData = JSON.parse(serializedData);
      if (!Array.isArray(parsedData)) {
        throw new Error('Invalid storage data format');
      }

      const deadlines = parsedData.map(d => ({
        ...d,
        dueDate: new Date(d.dueDate)
      }));

      if (!StorageValidator.validateDeadlines(deadlines)) {
        throw new Error('Invalid deadline data in storage');
      }

      this.currentId = Math.max(...deadlines.map(d => d.id), 0) + 1;
      this.deadlines.next(this.updateDaysRemaining(deadlines));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Try to restore from backup
      if (!this.restoreFromBackup()) {
        // If restore fails, start fresh
        this.deadlines.next([]);
      }
    }
  }
} 