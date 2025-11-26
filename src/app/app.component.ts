import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'demat-fiche-mutuelle';
  constructor(private translate: TranslateService) {
    this.initTranslateService();
  }
  initTranslateService(): void {
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang') || 'en';
    this.translate.use(savedLang);
  }
}
