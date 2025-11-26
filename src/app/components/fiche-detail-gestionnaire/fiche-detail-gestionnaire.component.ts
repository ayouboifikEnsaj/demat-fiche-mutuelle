import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Fiche} from '../../models/Fiche';
import {ActivatedRoute, Router} from '@angular/router';
import {FicheService} from '../../services/fiche.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-fiche-detail-gestionnaire',
  standalone: false,
  templateUrl: './fiche-detail-gestionnaire.component.html',
  styleUrl: './fiche-detail-gestionnaire.component.css'
})
export class FicheDetailGestionnaireComponent implements OnInit {
  fiche: Fiche | null = null;
  qrCodeUrl: string = '';
  pdfUrl: string = '';
  showPdfViewer = false;
  commentaire: string = '';
  modalTitle: string = '';
  actionType: 'REJET' | 'COMPLEMENT' = 'REJET';

  @ViewChild('openModalBtn') openModalBtn!: ElementRef<HTMLButtonElement>;

  constructor(
    private route: ActivatedRoute,
    private ficheService: FicheService,
    private router: Router,
    private translateService: TranslateService,
  ) {
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

  formatStatut(statut: string): string {
    return statut.replace(/_/g, ' ');
  }

  openPdfViewer(fileCode: string) {
    this.pdfUrl = `http://localhost:8080/api/attachment/view/${fileCode}`;
    this.showPdfViewer = true;
  }

  closePdfViewer() {
    this.showPdfViewer = false;
    this.pdfUrl = '';
  }

  validerFiche(id: number) {
    this.ficheService.validerFiche(id).subscribe({
      next: () => {
        alert('Fiche validée avec succès.');
        this.router.navigate(['/gestionnaire-home']);
      },
      error: (err) => {
        console.error('Erreur lors de la validation', err);
        alert('Échec de la validation.');
      }
    });
  }

  //
  ouvrirModal(type: 'REJET' | 'COMPLEMENT') {
    this.commentaire = '';
    this.actionType = type;

    const key = type === 'REJET' ? 'REJET_TITLE' : 'COMPLEMENT_TITLE';
    this.translateService.get(key).subscribe(translated => {
      this.modalTitle = translated;
      setTimeout(() => this.openModalBtn.nativeElement.click(), 0);
    });
  }


  confirmerAction() {
    const id = this.fiche?.id;
    if (!id) {
      alert("ID introuvable.");
      return;
    }

    const closeModalProperly = () => {
      const modalElement = document.getElementById('commentModal');
      if (modalElement) {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        modalElement.removeAttribute('aria-modal');
        modalElement.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
      }
    };

    if (this.actionType === 'REJET') {
      this.ficheService.rejeterFiche(id, this.commentaire).subscribe({
        next: () => {
          alert('Fiche rejetée.');
          closeModalProperly();
          this.router.navigate(['/gestionnaire-home']);
        },
        error: err => {
          alert("Erreur de rejet.");
          closeModalProperly();
        }
      });
    } else {
      this.ficheService.retourPourComplement(id, this.commentaire).subscribe({
        next: () => {
          alert('Retour CI envoyé.');
          closeModalProperly();
          this.router.navigate(['/gestionnaire-home']);
        },
        error: err => {
          alert("Erreur d'envoi.");
          closeModalProperly();
        }
      });
    }
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
