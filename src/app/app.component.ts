import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModules } from './material.module';
import { DeadlineListComponent } from './components/deadline-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...MaterialModules,
    DeadlineListComponent
  ],
  template: `
    <div class="app-container">
      <header>
        <h1>Deadline Manager</h1>
      </header>
      <main>
        <app-deadline-list></app-deadline-list>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    header {
      background-color: #3f51b5;
      color: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      text-align: center;
    }

    main {
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'Deadline Manager';
}
