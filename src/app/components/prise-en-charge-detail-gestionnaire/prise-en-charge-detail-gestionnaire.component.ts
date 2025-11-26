// src/app/components/prise-en-charge-detail-gestionnaire/prise-en-charge-detail-gestionnaire.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PriseEnCharge } from '../../models/PriseEnCharge';
import { PriseEnChargeService } from '../../services/prise-en-charge.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-prise-en-charge-detail-gestionnaire',
  standalone: false,
  templateUrl: './prise-en-charge-detail-gestionnaire.component.html',
  styleUrls: ['./prise-en-charge-detail-gestionnaire.component.css']
})
export class PriseEnChargeDetailGestionnaireComponent implements OnInit {
  priseEnCharge: PriseEnCharge | null = null;
  pdfUrl: string = '';
  showPdfViewer = false;
  commentaire: string = '';
  modalTitle: string = '';
  actionType: 'REJET' | 'COMPLEMENT' = 'REJET';
  accordFile: File | null = null;
  showAccordModal: boolean = false;

  @ViewChild('openModalBtn') openModalBtn!: ElementRef<HTMLButtonElement>;

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

  validerPriseEnCharge(id: number) {
    this.priseEnChargeService.validerPriseEnCharge(id).subscribe({
      next: () => {
        this.translateService.get('PRISE_EN_CHARGE_VALIDEE').subscribe(msg => {
          alert(msg);
        });
        this.loadPriseEnCharge(id);
      },
      error: (err) => {
        console.error('Erreur lors de la validation', err);
        this.translateService.get('ERREUR_VALIDATION').subscribe(msg => {
          alert(msg);
        });
      }
    });
  }

  marquerEnCoursTraitement(id: number) {
    this.priseEnChargeService.marquerEnCoursTraitement(id).subscribe({
      next: () => {
        this.translateService.get('PRISE_EN_CHARGE_EN_COURS').subscribe(msg => {
          alert(msg);
        });
        this.loadPriseEnCharge(id);
      },
      error: (err) => {
        console.error('Erreur lors du marquage en cours', err);
        this.translateService.get('ERREUR_MARQUAGE').subscribe(msg => {
          alert(msg);
        });
      }
    });
  }

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
    const id = this.priseEnCharge?.id;
    if (!id) {
      this.translateService.get('ID_INTROUVABLE').subscribe(msg => {
        alert(msg);
      });
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
      this.priseEnChargeService.rejeterPriseEnCharge(id, this.commentaire).subscribe({
        next: () => {
          this.translateService.get('PRISE_EN_CHARGE_REJETEE').subscribe(msg => {
            alert(msg);
          });
          closeModalProperly();
          this.loadPriseEnCharge(id);
        },
        error: err => {
          this.translateService.get('ERREUR_REJET').subscribe(msg => {
            alert(msg);
          });
          closeModalProperly();
        }
      });
    } else {
      this.priseEnChargeService.retourPourComplement(id, this.commentaire).subscribe({
        next: () => {
          this.translateService.get('RETOUR_COMPLEMENT_ENVOYE').subscribe(msg => {
            alert(msg);
          });
          closeModalProperly();
          this.loadPriseEnCharge(id);
        },
        error: err => {
          this.translateService.get('ERREUR_ENVOI').subscribe(msg => {
            alert(msg);
          });
          closeModalProperly();
        }
      });
    }
  }

  onAccordFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.translateService.get('FORMAT_PDF_REQUIS').subscribe(msg => {
          alert(msg);
        });
        event.target.value = '';
        return;
      }
      this.accordFile = file;
    }
  }

  envoyerAccord(): void {
    const id = this.priseEnCharge?.id;
    if (!id || !this.accordFile) {
      this.translateService.get('ACCORD_FICHIER_REQUIS').subscribe(msg => {
        alert(msg);
      });
      return;
    }

    const formData = new FormData();
    formData.append('accordFile', this.accordFile);

    this.priseEnChargeService.ajouterAccord(id, formData).subscribe({
      next: () => {
        this.fermerModalImmediatement('accordModal');
        this.translateService.get('ACCORD_ENVOYE').subscribe(msg => {
          alert(msg);
        });
        this.loadPriseEnCharge(id);
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi de l\'accord', error);
        this.translateService.get('ERREUR_ENVOI_ACCORD').subscribe(msg => {
          alert(msg);
        });
      }
    });
  }

  ouvrirModalAccord(): void {
    this.showAccordModal = true;
    this.accordFile = null;
  }

  private fermerModalImmediatement(modalId: string): void {
    if (modalId === 'accordModal') {
      this.showAccordModal = false;
    } else {
      // Garder le code existant pour les autres modales
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');

        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());

        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.overflow = 'visible';
      }
    }
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

  // Méthode pour confirmer les actions importantes
  confirmerAvantAction(action: string, id: number): void {
    if (!id) return;

    let messageKey = '';
    let actionFn: () => void = () => {};

    switch (action) {
      case 'valider':
        messageKey = 'CONFIRMER_VALIDATION';
        actionFn = () => this.validerPriseEnCharge(id);
        break;
      case 'enCours':
        messageKey = 'CONFIRMER_EN_COURS';
        actionFn = () => this.marquerEnCoursTraitement(id);
        break;
      default:
        return;
    }

    this.translateService.get(messageKey).subscribe(msg => {
      if (confirm(msg)) {
        actionFn();
      }
    });
  }
}
