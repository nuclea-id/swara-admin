import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../core/services/firestore.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  firestoreService = inject(FirestoreService);
  events$!: Observable<any[]>;

  ngOnInit() {
    this.events$ = this.firestoreService.getRevenueCatEvents(50);
  }
}
