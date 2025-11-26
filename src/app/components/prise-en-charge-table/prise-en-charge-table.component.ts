// src/app/components/prise-en-charge-table/prise-en-charge-table.component.ts
import { Component, OnInit } from '@angular/core';
import { PriseEnCharge } from '../../models/PriseEnCharge';
import { EmployeeResponse } from '../../models/employeresponse';
import { PriseEnChargeService } from '../../services/prise-en-charge.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

declare var bootstrap: any;

@Component({
  selector: 'app-prise-en-charge-table',
  standalone: false,
  templateUrl: './prise-en-charge-table.component.html',
  styleUrls: ['./prise-en-charge-table.component.css']
})
export class PriseEnChargeTableComponent implements OnInit {
  priseEnCharges: PriseEnCharge[] = [];
  filteredPriseEnCharges: PriseEnCharge[] = [];
  user: EmployeeResponse | null = null;
  selectedPriseEnCharge: PriseEnCharge | null = null;

  dateSoumission: string = '';
  motif: string = '';
  statut: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 7;

  get paginatedPriseEnCharges(): PriseEnCharge[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPriseEnCharges.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPriseEnCharges.length / this.itemsPerPage);
  }

  selectedPriseEnChargeId: number | null = null;
  complementFile: File | null = null;

  statutMap: { [key: string]: string } = {
    ENATTENTE: 'En_attente',
    VALIDEE: 'validée_par_rh',
    REJETEE: 'Rejete',
    RETOURCOMPLEMENT: "Retour_complement_d'informations",
    ENCOURDETRAIATEMENT: "en_cour_de_traitement_par_assurance",
    ACCORDER: "accorder"
  };

  constructor(
    private priseEnChargeService: PriseEnChargeService,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    this.initTranslateService();
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();

    if (this.user?.id) {
      this.priseEnChargeService.getPriseEnChargesByEmployeeId(this.user.id).subscribe(data => {
        this.priseEnCharges = data;
        this.filterPriseEnCharges();
        console.log("✅ Prises en charge reçues :", this.priseEnCharges);
      });
    }
  }

  filterPriseEnCharges(): void {
    const expectedStatut = this.statutMap[this.statut];

    let filtered = this.priseEnCharges.filter(priseEnCharge => {
      const matchDateSoum = !this.dateSoumission || priseEnCharge.dateSoumission?.startsWith(this.dateSoumission);
      const matchMotif = !this.motif || priseEnCharge.motif?.toLowerCase().includes(this.motif.toLowerCase());
      const matchStatut = !this.statut || priseEnCharge.statutPriseEnCharge === expectedStatut;

      return matchDateSoum && matchMotif && matchStatut;
    });

    // Tri par dateSoumission DESC, puis par id DESC
    this.filteredPriseEnCharges = filtered.sort((a, b) => {
      const dateDiff = new Date(b.dateSoumission || '').getTime() - new Date(a.dateSoumission || '').getTime();
      if (dateDiff !== 0) return dateDiff;
      return ((b.id || 0) - (a.id || 0));
    });

    this.currentPage = 1;
  }

  initTranslateService(): void {
    this.translateService.addLangs(['fr', 'en']);
    this.translateService.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang');
    const langToUse = savedLang || 'en';
    this.translateService.use(langToUse);
  }

  getStatutKey(statut: string): string {
    switch (statut) {
      case 'En_attente': return 'FILTRE.STATUT.ENATTENTE.PRISE';
      case 'validée_par_rh': return 'FILTRE.STATUT.VALIDEE.PRISE';
      case 'Rejete': return 'FILTRE.STATUT.REJETEE';
      case "Retour_complement_d'informations": return 'FILTRE.STATUT.RETOURCOMPLEMENT';
      case "en_cour_de_traitement_par_assurance": return 'FILTRE.STATUT.ENCOURSTRAITEMENT.PRISE';
      case "accorder": return 'FILTRE.STATUT.ACCORDER.PRISE';
      default: return statut;
    }
  }

  setSelectedPriseEnCharge(priseEnCharge: PriseEnCharge): void {
    this.selectedPriseEnChargeId = priseEnCharge.id || null;
    this.complementFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.translateService.get('FORMAT_PDF_REQUIS').subscribe(msg => {
          alert(msg);
        });
        event.target.value = '';
        return;
      }
      this.complementFile = file;
    }
  }

  envoyerComplement(): void {
    if (!this.selectedPriseEnChargeId || !this.complementFile) {
      this.translateService.get('FICHIER_REQUIS').subscribe(msg => {
        alert(msg);
      });
      return;
    }

    const formData = new FormData();
    formData.append('complementFile', this.complementFile);

    this.priseEnChargeService.ajouterComplement(this.selectedPriseEnChargeId, formData).subscribe({
      next: () => {
        this.fermerModalImmediatement();
        this.translateService.get('COMPLEMENT_ENVOYE').subscribe(msg => {
          alert('✅ ' + msg);
        });
        this.ngOnInit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de l\'envoi du complément', error);
        this.translateService.get('ERREUR_ENVOI_COMPLEMENT').subscribe(msg => {
          alert(msg);
        });
      }
    });
  }

  private fermerModalImmediatement(): void {
    const modalElement = document.getElementById('complementModal');
    if (modalElement) {
      if (typeof bootstrap !== 'undefined') {
        const instance = bootstrap.Modal.getInstance(modalElement);
        if (instance) {
          instance.hide();
        }
      }

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

      setTimeout(() => {
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
        window.dispatchEvent(new Event('resize'));
      }, 100);

      this.selectedPriseEnChargeId = null;
      this.complementFile = null;

      // Réinitialiser le formulaire
      const fileInput = document.getElementById('complementFile') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  telechargerModeleFiche(): void {
    this.priseEnChargeService.telechargerModeleFiche().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modele-prise-en-charge.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du modèle', error);
        this.translateService.get('ERREUR_TELECHARGEMENT').subscribe(msg => {
          alert(msg);
        });
      }
    });
  }

  // Méthode pour prévisualiser un document PDF dans une nouvelle fenêtre
  previsualiserDocument(fileCode: string): void {
    if (!fileCode) return;

    const url = `http://localhost:8080/api/attachment/view/${fileCode}`;
    window.open(url, '_blank');
  }

  // Méthode pour confirmer avant de soumettre un complément
  confirmerEnvoiComplement(): void {
    if (!this.complementFile) {
      this.translateService.get('FICHIER_REQUIS').subscribe(msg => {
        alert(msg);
      });
      return;
    }

    this.translateService.get('CONFIRMER_ENVOI_COMPLEMENT').subscribe(msg => {
      if (confirm(msg)) {
        this.envoyerComplement();
      }
    });
  }
}
