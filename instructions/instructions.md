# Product Requirements Document (PRD)

## Project Overview

You are building an Angular web application that allows users to view and manage a list of upcoming calendar deadlines.

### **Technologies Used**

- Angular 19
- Angular Material UI controls
- CSS
- Lucide Icons

## **Core Functionalities**

### **1. Deadline Definition**

Each deadline consists of the following details:

- **Task Title**: A short description of the task.
- **Due Date**: The date the task is due.
- **Number of Days Remaining**: Automatically calculated from the due date.
- **Priority**: Allows users to set the urgency level of the deadline.
- **Description**: A longer, optional description of the task.

### **2. Displaying Deadlines**

- Show all upcoming deadlines as a list of cards.
- Sort the list in **ascending order** based on the number of days remaining.
- Each card should display all deadline details.

### **3. Adding a New Deadline**

- A button to add a new deadline.
- Clicking the button opens a **modal dialog** where users can enter details.
- The modal should contain form fields for all required details.
- Upon submission, the deadline should be added to the stored list.

### **4. Data Storage**

- For now, store all deadlines **within the application’s memory**.
- Use a **service-based approach** to manage deadlines.
- Future versions may introduce persistent storage (e.g., LocalStorage, database).

### **5. Exporting Deadlines**

- Provide a button to **export and download** the currently defined deadlines.
- The export format should be **JSON**.
- Ensure the exported file contains **all deadline details**.

### **6. Importing Deadlines**

- Provide an interface to **import a previously exported JSON file**.
- The import feature should be accessible via a **modal dialog**.
- The modal should support:
  - Drag-and-drop file upload.
  - A button to manually browse and select a file.
- Validate the JSON structure before loading the data.
- Display an error message if the file format is invalid.

## **File Structure**

```
deadline
├───src
│   ├───app
│   │   ├───components
│   │   │   ├── deadline-list.component.ts  # Displays deadline cards
│   │   │   ├── deadline-form.component.ts  # Modal form for adding deadlines
│   │   │   ├── file-upload.component.ts    # Handles JSON import
│   │   ├───services
│   │   │   ├── deadline.service.ts         # Manages deadline data
│   │   ├── app.component.ts                # Main app component
│   │   ├── app.module.ts                   # Declares modules & components
│   │   ├── app.routes.ts                   # Routing setup (if needed)
│   ├───assets                              # Store static files (icons, JSON)
│   ├───styles.css                          # Global styles
│   ├───main.ts                             # Bootstrap Angular
│   ├───index.html                          # App entry point
```

## **Example Code for File Upload**

### **Component Code for JSON Import**

```typescript
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

  onDragOver(event: DragEvent) { event.preventDefault(); this.isDragging = true; }
  onDragLeave(event: DragEvent) { event.preventDefault(); this.isDragging = false; }
  onDrop(event: DragEvent) { /* Handle file drop */ }
  onFileSelected(event: Event) { /* Handle file selection */ }
}
```

