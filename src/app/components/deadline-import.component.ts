import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModules } from '../material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeadlineService } from '../services/deadline.service';
import { MatListModule } from '@angular/material/list';
import { Deadline } from '../models/deadline.interface';
import { StorageValidator } from '../services/storage.validator';

@Component({
  selector: 'app-deadline-import',
  standalone: true,
  imports: [CommonModule, ...MaterialModules, MatListModule],
  template: `
    <h2 mat-dialog-title>Import Deadlines</h2>
    
    <mat-dialog-content>
      <div class="import-container">
        <div
          class="drop-zone"
          [class.dragover]="isDragging"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)">
          <mat-icon>upload_file</mat-icon>
          <p>Drag and drop JSON file here</p>
          <p>OR</p>
          <input
            type="file"
            #fileInput
            accept=".json"
            (change)="onFileSelected($event)"
            style="display: none">
          <button mat-raised-button color="primary" (click)="fileInput.click()">
            Choose File
          </button>
        </div>

        <div *ngIf="selectedFile" class="file-info">
          <mat-icon color="primary">description</mat-icon>
          <span>{{ selectedFile.name }}</span>
          <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
        </div>

        <div *ngIf="error" class="error-message">
          <mat-icon color="warn">error</mat-icon>
          <span>{{ error }}</span>
        </div>

        <div *ngIf="importPreview" class="preview-container">
          <h3>Import Preview</h3>
          <p>Found {{ importPreview.length }} valid deadline(s)</p>
          <mat-list>
            <mat-list-item *ngFor="let deadline of importPreview.slice(0, 3)">
              <mat-icon matListItemIcon>event</mat-icon>
              <div matListItemTitle>{{ deadline.title }}</div>
              <div matListItemLine>Due: {{ deadline.dueDate | date:'mediumDate' }}</div>
            </mat-list-item>
            <mat-list-item *ngIf="importPreview.length > 3">
              <div matListItemTitle>And {{ importPreview.length - 3 }} more...</div>
            </mat-list-item>
          </mat-list>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!importPreview || importPreview.length === 0"
        (click)="onImport()">
        Import {{ importPreview ? importPreview.length : 0 }} Deadline(s)
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .import-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 400px;
      padding: 1rem 0;
    }

    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      background: #fafafa;
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .drop-zone.dragover {
      border-color: #2196f3;
      background: #e3f2fd;
    }

    .drop-zone mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .file-size {
      color: #666;
      margin-left: auto;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #fff3e0;
      color: #d32f2f;
      border-radius: 4px;
    }

    .preview-container {
      background: #f5f5f5;
      border-radius: 4px;
      padding: 1rem;
    }

    .preview-container h3 {
      margin: 0 0 0.5rem 0;
    }

    mat-list {
      max-height: 200px;
      overflow-y: auto;
    }
  `]
})
export class DeadlineImportComponent {
  isDragging = false;
  selectedFile: File | null = null;
  error: string | null = null;
  importPreview: Deadline[] | null = null;

  constructor(
    private dialogRef: MatDialogRef<DeadlineImportComponent>,
    private deadlineService: DeadlineService,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.error = null;
    this.importPreview = null;

    if (!file.name.toLowerCase().endsWith('.json')) {
      this.error = 'Please select a JSON file';
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      this.error = 'File size exceeds 1MB limit';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
          throw new Error('Invalid file format. Expected an array of deadlines.');
        }

        // Validate and preview the data
        const validDeadlines = data
          .map(d => this.validateDeadlineData(d))
          .filter((d): d is Deadline => d !== null);

        if (validDeadlines.length === 0) {
          throw new Error('No valid deadlines found in the file.');
        }

        this.importPreview = validDeadlines;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to parse file';
        this.importPreview = null;
      }
    };

    reader.onerror = () => {
      this.error = 'Error reading file';
      this.importPreview = null;
    };

    reader.readAsText(file);
  }

  private validateDeadlineData(data: any): Deadline | null {
    return StorageValidator.sanitizeDeadline(data);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onImport(): void {
    if (!this.importPreview) return;

    try {
      this.deadlineService.importDeadlines(this.importPreview);
      this.dialogRef.close(true);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to import deadlines';
    }
  }
} 