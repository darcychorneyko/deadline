import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModules } from '../material.module';
import { Deadline, Priority } from '../models/deadline.interface';

@Component({
  selector: 'app-deadline-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...MaterialModules
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditing ? 'Edit' : 'Add' }} Deadline</h2>
    
    <form [formGroup]="deadlineForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
            <mat-label>Task Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter task title">
            <mat-error *ngIf="deadlineForm.get('title')?.errors?.['required']">
              Title is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="deadlineForm.get('dueDate')?.errors?.['required']">
              Due date is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option *ngFor="let priority of priorities" [value]="priority">
                {{ priority }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="deadlineForm.get('priority')?.errors?.['required']">
              Priority is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" 
                      placeholder="Enter task description (optional)"
                      rows="3"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" 
                type="submit"
                [disabled]="deadlineForm.invalid">
          {{ isEditing ? 'Update' : 'Add' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 400px;
      padding: 1rem 0;
    }

    textarea {
      resize: vertical;
    }
  `]
})
export class DeadlineFormComponent implements OnInit {
  deadlineForm: FormGroup;
  isEditing: boolean = false;
  priorities = Object.values(Priority);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DeadlineFormComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { deadline?: Deadline }
  ) {
    this.deadlineForm = this.fb.group({
      title: ['', Validators.required],
      dueDate: [new Date(), Validators.required],
      priority: [Priority.MEDIUM, Validators.required],
      description: ['']
    });

    if (data?.deadline) {
      this.isEditing = true;
      this.deadlineForm.patchValue({
        ...data.deadline,
        dueDate: new Date(data.deadline.dueDate)
      });
    }
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.deadlineForm.valid) {
      const formValue = this.deadlineForm.value;
      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 