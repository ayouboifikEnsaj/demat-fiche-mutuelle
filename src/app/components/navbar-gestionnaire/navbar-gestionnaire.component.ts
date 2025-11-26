import { Component } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {TranslateService} from '@ngx-translate/core';
import {EmployeeResponse} from '../../models/employeresponse';

@Component({
  selector: 'app-navbar-gestionnaire',
  standalone: false,
  templateUrl: './navbar-gestionnaire.component.html',
  styleUrl: './navbar-gestionnaire.component.css'
})
export class NavbarGestionnaireComponent {
  user: EmployeeResponse | null = null;
  avatarUrl: string | null = null;

  constructor(private authService: AuthService, private translateService: TranslateService) {
    this.initTranslateService();
  }
  ngOnInit(): void {
    this.user = this.authService.getUser();

    if (this.user?.attachment?.file && this.user?.attachment?.type) {
      this.avatarUrl = `data:${this.user.attachment.type};base64,${this.user.attachment.file}`;
    } else {
      this.avatarUrl = null;
    }

    console.log('Langue active :', this.translateService.currentLang);
    console.log('Traduction ACCUEIL :', this.translateService.instant('ACCUEIL'));
  }
  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
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
