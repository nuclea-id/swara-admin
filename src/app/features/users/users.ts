import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FirestoreService, AdminUser } from '../../core/services/firestore.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  firestoreService = inject(FirestoreService);
  
  admins = toSignal(this.firestoreService.getAdmins(), { initialValue: [] as AdminUser[] });
  
  adminEmailControl = new FormControl('');
  isAddingAdmin = signal<boolean>(false);
  removingUid = signal<string | null>(null);
  addMessage = signal<string | null>(null);
  addError = signal<string | null>(null);

  ngOnInit() {
    // Initialization handled by toSignal
  }

  async addAdmin() {
    const email = this.adminEmailControl.value;
    if (!email) return;
    
    this.isAddingAdmin.set(true);
    this.addMessage.set(null);
    this.addError.set(null);

    try {
      const response: any = await this.firestoreService.addAdminRole(email);
      this.addMessage.set(response.message);
      this.adminEmailControl.setValue(''); // reset form
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to add admin';
      this.addError.set(msg);
    } finally {
      this.isAddingAdmin.set(false);
    }
  }

  async removeAdmin(uid: string) {
    if (!confirm('Are you sure you want to remove this admin?')) return;

    this.removingUid.set(uid);
    this.addMessage.set(null);
    this.addError.set(null);

    try {
      const response: any = await this.firestoreService.removeAdminRole(uid);
      this.addMessage.set(response.message);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to remove admin';
      this.addError.set(msg);
    } finally {
      this.removingUid.set(null);
    }
  }
}
