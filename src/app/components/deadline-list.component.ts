import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModules } from '../material.module';
import { listAnimation, cardAnimation, chipAnimation } from '../animations/deadline.animations';
import { MatDialog } from '@angular/material/dialog';

import { DeadlineService } from '../services/deadline.service';
import { Deadline, Priority, CreateDeadlineDto } from '../models/deadline.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-deadline-list',
  standalone: true,
  imports: [
    CommonModule,
    ...MaterialModules
  ],
  templateUrl: './deadline-list.component.html',
  styleUrls: ['./deadline-list.component.css'],
  animations: [listAnimation, cardAnimation, chipAnimation]
})
export class DeadlineListComponent implements OnInit {
  deadlines$: Observable<Deadline[]>;

  constructor(
    private deadlineService: DeadlineService,
    private dialog: MatDialog
  ) {
    this.deadlines$ = this.deadlineService.getDeadlines();
  }

  ngOnInit(): void {}

  exportDeadlines(): void {
    const deadlines = this.deadlineService.exportDeadlines();
    const dataStr = JSON.stringify(deadlines, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `deadlines_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  }

  openDeadlineForm(deadline?: Deadline): void {
    import('./deadline-form.component').then(({ DeadlineFormComponent }) => {
      const dialogRef = this.dialog.open(DeadlineFormComponent, {
        data: { deadline },
        width: '500px'
      });

      dialogRef.afterClosed().subscribe((result: CreateDeadlineDto) => {
        if (result) {
          if (deadline) {
            this.deadlineService.updateDeadline(deadline.id, result);
          } else {
            this.deadlineService.addDeadline(result);
          }
        }
      });
    });
  }

  openImportDialog(): void {
    import('./deadline-import.component').then(({ DeadlineImportComponent }) => {
      const dialogRef = this.dialog.open(DeadlineImportComponent, {
        width: '500px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Import was successful
          // The service has already updated the deadlines list
          // and the template will automatically update
        }
      });
    });
  }

  getPriorityClass(priority: Priority): string {
    return {
      [Priority.HIGH]: 'priority-high',
      [Priority.MEDIUM]: 'priority-medium',
      [Priority.LOW]: 'priority-low'
    }[priority];
  }

  getDaysRemainingClass(days: number): string {
    if (days <= 3) return 'days-urgent';
    if (days <= 7) return 'days-warning';
    return 'days-normal';
  }

  getDaysRemainingText(days: number): string {
    if (days <= 3) return 'Due Soon!';
    if (days <= 7) return 'Upcoming';
    return 'On Track';
  }

  onEdit(deadline: Deadline): void {
    this.openDeadlineForm(deadline);
  }

  onDelete(deadline: Deadline): void {
    if (confirm('Are you sure you want to delete this deadline?')) {
      this.deadlineService.deleteDeadline(deadline.id);
    }
  }
} 