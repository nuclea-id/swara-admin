import { inject, NgZone, Injector, runInInjectionContext, Service } from '@angular/core';
import { Firestore, collection, query, orderBy, limit, onSnapshot } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable } from 'rxjs';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export interface RevenueCatEvent {
  id: string;
  event_timestamp_ms?: number;
  [key: string]: unknown;
}

interface CountResponse {
  count: number;
}

@Service()
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);
  private functions: Functions = inject(Functions);
  private zone: NgZone = inject(NgZone);
  private injector: Injector = inject(Injector);

  getAdmins(): Observable<AdminUser[]> {
    return new Observable(observer => {
      return runInInjectionContext(this.injector, () => {
        const adminsRef = collection(this.firestore, 'admins');
        return onSnapshot(adminsRef, (snapshot) => {
          this.zone.run(() => observer.next(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser))));
        }, (error) => this.zone.run(() => observer.error(error)));
      });
    });
  }

  async getTotalAuthUsers(): Promise<number> {
    return runInInjectionContext(this.injector, async () => {
      const getCount = httpsCallable<unknown, CountResponse>(this.functions, 'getAuthUsersCount');
      const result = await getCount();
      return result.data.count;
    });
  }

  getRevenueCatEvents(eventLimit: number = 100): Observable<RevenueCatEvent[]> {
    return new Observable(observer => {
      return runInInjectionContext(this.injector, () => {
        const eventsRef = collection(this.firestore, 'revenuecat_events');
        const q = query(eventsRef, orderBy('event_timestamp_ms', 'desc'), limit(eventLimit));
        return onSnapshot(q, (snapshot) => {
          this.zone.run(() => observer.next(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RevenueCatEvent))));
        }, (error) => this.zone.run(() => observer.error(error)));
      });
    });
  }

  async addAdminRole(email: string): Promise<unknown> {
    return runInInjectionContext(this.injector, async () => {
      const addAdmin = httpsCallable<{email: string}, unknown>(this.functions, 'addAdminRole');
      const result = await addAdmin({ email });
      return result.data;
    });
  }

  async removeAdminRole(uid: string): Promise<unknown> {
    return runInInjectionContext(this.injector, async () => {
      const removeAdmin = httpsCallable<{uid: string}, unknown>(this.functions, 'removeAdminRole');
      const result = await removeAdmin({ uid });
      return result.data;
    });
  }
}
