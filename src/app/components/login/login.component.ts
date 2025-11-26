import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {LoginEmployeDto} from '../../models/login-employe.dto';
import {AuthService} from '../../services/auth.service';
import {FormsModule} from '@angular/forms';
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginData: LoginEmployeDto = {
    email: '',
    password: ''
  };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private translateService: TranslateService) {
    this.initTranslateService();
  }

  onLogin(): void {
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        // Stocker le token et l'utilisateur
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.employee));

        // Redirection après login
        this.authService.redirectBasedOnRole();
      },
      error: (err) => {
        this.errorMessage = 'Email ou mot de passe incorrect';
        console.error('Login error', err);
      }
    });
  }

  initTranslateService(): void {
    this.translateService.addLangs(['fr', 'en']);
    this.translateService.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang');
    const langToUse = savedLang || 'en';
    this.translateService.use(langToUse);
  }


  switchLang(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem('lang', lang);
  }
}
