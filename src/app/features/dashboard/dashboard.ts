import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../core/services/firestore.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  firestoreService = inject(FirestoreService);
  
  totalUsers = signal<number>(0);
  totalTransactions = signal<number>(0);
  errorMessage = signal<string>('');
  isLoadingUsers = signal<boolean>(true);

  async ngOnInit() {
    this.firestoreService.getRevenueCatEvents(1000).subscribe({
      next: (events) => {
        this.totalTransactions.set(events.length);
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.errorMessage.set(err.message);
      }
    });

    try {
      const count = await this.firestoreService.getTotalAuthUsers();
      this.totalUsers.set(count);
      this.isLoadingUsers.set(false);
    } catch (err: unknown) {
      console.error('Error fetching auth users count:', err);
      const msg = err instanceof Error ? err.message : 'Failed to fetch users count';
      this.errorMessage.set(msg);
      this.isLoadingUsers.set(false);
    }
  }
}
