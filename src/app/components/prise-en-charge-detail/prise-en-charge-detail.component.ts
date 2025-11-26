// src/app/components/prise-en-charge-detail/prise-en-charge-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PriseEnCharge } from '../../models/PriseEnCharge';
import { PriseEnChargeService } from '../../services/prise-en-charge.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-prise-en-charge-detail',
  standalone: false,
  templateUrl: './prise-en-charge-detail.component.html',
  styleUrls: ['./prise-en-charge-detail.component.css']
})
export class PriseEnChargeDetailComponent implements OnInit {
  priseEnCharge: PriseEnCharge | null = null;
  pdfUrl: string = '';
  showPdfViewer = false;

  constructor(
    private route: ActivatedRoute,
    private priseEnChargeService: PriseEnChargeService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.initTranslateService();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPriseEnCharge(id);
  }

  loadPriseEnCharge(id: number): void {
    this.priseEnChargeService.getPriseEnChargeById(id).subscribe(data => {
      this.priseEnCharge = data;
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
    this.pdfUrl = `http://localhost:8080/api/attachment/view/${fileCode}`;
    this.showPdfViewer = true;
  }

  closePdfViewer() {
    this.showPdfViewer = false;
    this.pdfUrl = '';
  }

  getStatutTranslationKey(statut: string): string {
    switch (statut) {
      case 'En_attente': return 'FILTRE.STATUT.ENATTENTE';
      case 'validée_par_rh': return 'FILTRE.STATUT.VALIDEE';
      case 'Rejete': return 'FILTRE.STATUT.REJETEE';
      case "Retour_complement_d'informations": return 'FILTRE.STATUT.RETOURCOMPLEMENT';
      case "en_cour_de_traitement_par_assurance": return 'FILTRE.STATUT.ENCOURSTRAITEMENT';
      case "accorder": return 'FILTRE.STATUT.ACCORDER';
      default: return statut;
    }
  }

  retourListe(): void {
    this.router.navigate(['/prise-en-charge']);
  }
}
