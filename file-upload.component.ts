import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      <div 
        class="drop-zone" 
        (dragover)="onDragOver($event)" 
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        [class.dragover]="isDragging">
        <p>Drag and drop JSON files here</p>
        <p>OR</p>
        <input 
          type="file" 
          #fileInput
          accept=".json"
          (change)="onFileSelected($event)"
          style="display: none">
        <button (click)="fileInput.click()">Choose JSON File</button>
      </div>
      <div *ngIf="selectedFile" class="file-info">
        <p>Selected file: {{ selectedFile?.name }}</p>
        <p>Size: {{ (selectedFile?.size || 0 / 1024).toFixed(2) }} KB</p>
      </div>
      <div *ngIf="jsonContent" class="json-content">
        <h3>JSON Content:</h3>
        <pre>{{ jsonContent | json }}</pre>
      </div>
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      padding: 20px;
    }
    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 4px;
      padding: 20px;
      text-align: center;
      background: #f9f9f9;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .drop-zone.dragover {
      background: #e1e1e1;
      border-color: #999;
    }
    .drop-zone p {
      margin: 10px 0;
      color: #666;
    }
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
    .file-info {
      margin-top: 20px;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    .json-content {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
      overflow-x: auto;
    }
    .json-content pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .error-message {
      margin-top: 20px;
      padding: 10px;
      background: #fff3cd;
      color: #856404;
      border-radius: 4px;
      border: 1px solid #ffeeba;
    }
  `]
})
export class FileUploadComponent {
  isDragging = false;
  selectedFile: File | null = null;
  jsonContent: any = null;
  error: string | null = null;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    this.selectedFile = file;
    this.error = null;
    this.jsonContent = null;

    if (!file.name.toLowerCase().endsWith('.json')) {
      this.error = 'Please select a JSON file';
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const text = e.target?.result as string;
        this.jsonContent = JSON.parse(text);
      } catch (err) {
        this.error = 'Error parsing JSON file. Please make sure the file contains valid JSON.';
        console.error('JSON parsing error:', err);
      }
    };

    reader.onerror = () => {
      this.error = 'Error reading file. Please try again.';
      console.error('FileReader error:', reader.error);
    };

    reader.readAsText(file);
  }
} 