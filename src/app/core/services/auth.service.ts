import { inject, Injector, runInInjectionContext, Service } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, idToken } from '@angular/fire/auth';
import { Observable, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Service()
export class AuthService {
  private auth: Auth = inject(Auth);
  private injector: Injector = inject(Injector);

  user$ = user(this.auth);
  userSig = toSignal(this.user$);

  isAdmin$: Observable<boolean> = this.user$.pipe(
    switchMap(async (u) => {
      if (!u) return false;
      const token = await u.getIdTokenResult();
      return !!token.claims['admin'];
    })
  );
  isAdminSig = toSignal(this.isAdmin$);

  async loginWithGoogle() {
    return runInInjectionContext(this.injector, () => {
      const provider = new GoogleAuthProvider();
      return signInWithPopup(this.auth, provider);
    });
  }

  async logout() {
    return runInInjectionContext(this.injector, () => {
      return signOut(this.auth);
    });
  }
}
