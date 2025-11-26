import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FicheService } from '../../services/fiche.service';
import { Fiche } from '../../models/Fiche';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fiche-detail',
  templateUrl: './fiche-detail.component.html',
  styleUrls: ['./fiche-detail.component.css'],
  standalone: false
})
export class FicheDetailComponent implements OnInit {
  fiche: Fiche | null = null;
  qrCodeUrl: string = '';
  pdfUrl: string = '';
  showPdfViewer = false;
  isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private ficheService: FicheService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initTranslateService();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ficheService.getFicheById(id).subscribe(data => {
      this.fiche = data;
      if (this.fiche?.numDossier) {
        this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${this.fiche.numDossier}`;
      }
    });
  }

  initTranslateService(): void {
    this.translateService.addLangs(['en', 'fr']);
    this.translateService.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang');
    const langToUse = savedLang || 'en';
    this.translateService.use(langToUse);
  }


  openPdfViewer(fileCode: string) {
    if (!this.isBrowser) return;
    this.pdfUrl = `http://localhost:8080/api/attachment/view/${fileCode}`;
    this.showPdfViewer = true;
  }

  closePdfViewer() {
    this.showPdfViewer = false;
    this.pdfUrl = '';
  }

  formatStatut(statut: string): string {
    return statut.replace(/_/g, ' ');
  }
  getStatutTranslationKey(statut: string): string {
    switch (statut) {
      case 'En_attente': return 'FILTRE.STATUT.ENATTENTE';
      case 'Validee': return 'FILTRE.STATUT.VALIDEE';
      case 'Rejete': return 'FILTRE.STATUT.REJETEE';
      case "Retour_complement_d'informations": return 'FILTRE.STATUT.RETOURCOMPLEMENT';
      default: return statut;
    }
  }

  getPatientKey(code: string): string {
    switch (code?.toUpperCase()) {
      case 'LUI_MEME': return 'MOI';
      case 'CONJOINT': return 'CONJOINT';
      case 'ENFANT': return 'ENFANT';
      default: return code?.toUpperCase() || '';
    }
  }


  getDocumentTypeLabel(typeDoc: string): string {
    const key = 'SECTION.' + typeDoc.toUpperCase();
    return this.translateService.instant(key);
  }
}
