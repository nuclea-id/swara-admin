import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  authService = inject(AuthService);
  router = inject(Router);

  async login() {
    try {
      const result = await this.authService.loginWithGoogle();
      const token = await result.user.getIdTokenResult();
      
      if (token.claims['admin']) {
        this.router.navigate(['/dashboard']);
      } else {
        await this.authService.logout();
        alert('Access Denied: Anda tidak memiliki akses admin.');
      }
    } catch (error) {
      console.error('Login error', error);
      alert('Login failed. Please try again.');
    }
  }
}
