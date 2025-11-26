import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EmployeeResponse } from '../../models/employeresponse';
import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone:false,
  selector: 'app-navbar-employe',
  templateUrl: './navbar-employe.component.html',
  styleUrls: ['./navbar-employe.component.css']
})
export class NavbarEmployeComponent {
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

  initTranslateService(): void {
    this.translateService.addLangs(['fr', 'en']);
    this.translateService.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang');
    const langToUse = savedLang || 'en';
    this.translateService.use(langToUse);
  }


  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  switchLang(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem('lang', lang);
  }
}
