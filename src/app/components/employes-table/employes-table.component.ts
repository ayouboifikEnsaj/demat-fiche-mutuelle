import { Component, OnInit } from '@angular/core';
import { Fiche } from '../../models/Fiche';
import { EmployeeResponse } from '../../models/employeresponse';
import { FicheService } from '../../services/fiche.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import {HttpErrorResponse} from '@angular/common/http';

declare var bootstrap: any;
@Component({
  selector: 'app-employes-table',
  standalone: false,
  templateUrl: './employes-table.component.html',
  styleUrls: ['./employes-table.component.css']
})
export class EmployesTableComponent implements OnInit {
  fiches: Fiche[] = [];
  filteredFiches: Fiche[] = [];
  user: EmployeeResponse | null = null;
  selectedFiche: Fiche | null = null;

  dateConsultation: string = '';
  dateSoumission: string = '';
  numDossier: string = '';
  statut: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 7;

  get paginatedFiches(): Fiche[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFiches.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFiches.length / this.itemsPerPage);
  }

  selectedFicheId: number | null = null;
  complementFile: File | null = null;

  statutMap: { [key: string]: string } = {
    ENATTENTE: 'En_attente',
    VALIDEE: 'Validee',
    REJETEE: 'Rejete',
    RETOURCOMPLEMENT: "Retour_complement_d'informations"
  };

  constructor(
    private ficheService: FicheService,
    private authService: AuthService,
    private translateService: TranslateService
  ) {
    this.initTranslateService();
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();

    if (this.user?.id) {
      this.ficheService.getFichesByEmployeId(this.user.id).subscribe(data => {
        this.fiches = data;
        this.filterFiches(); // appliquer les filtres et trier
        console.log("✅ Fiches reçues :", this.fiches);
      });
    }
  }

  formatStatut(statut: string): string {
    switch (statut) {
      case 'En_attente': return 'En attente';
      case 'Validee': return 'Validée';
      case 'Rejete': return 'Rejetée';
      case "Retour_complement_d'informations": return 'Retour CI';
      default: return statut;
    }
  }

  filterFiches(): void {
    const expectedStatut = this.statutMap[this.statut];

    let filtered = this.fiches.filter(fiche => {
      const matchDateConsult = !this.dateConsultation || fiche.dateConsultation?.startsWith(this.dateConsultation);
      const matchDateSoum = !this.dateSoumission || fiche.dateSoumission?.startsWith(this.dateSoumission);
      const matchDossier = !this.numDossier || fiche.numDossier?.toLowerCase().includes(this.numDossier.toLowerCase());
      const matchStatut = !this.statut || fiche.statutFiche === expectedStatut;

      return matchDateConsult && matchDateSoum && matchDossier && matchStatut;
    });

    // Tri par dateSoumission DESC, puis par id DESC
    this.filteredFiches = filtered.sort((a, b) => {
      const dateDiff = new Date(b.dateSoumission).getTime() - new Date(a.dateSoumission).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (b.id || 0) - (a.id || 0); // fallback sur ID si présent
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


  switchLang(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem('lang', lang);
  }

  getPatientKey(code: string): string {
    switch (code?.toUpperCase()) {
      case 'LUI_MEME': return 'MOI';
      case 'CONJOINT': return 'CONJOINT';
      case 'ENFANT': return 'ENFANT';
      default: return code?.toUpperCase() || '';
    }
  }

  getStatutKey(statut: string): string {
    switch (statut) {
      case 'En_attente': return 'FILTRE.STATUT.ENATTENTE';
      case 'Validee': return 'FILTRE.STATUT.VALIDEE';
      case 'Rejete': return 'FILTRE.STATUT.REJETEE';
      case "Retour_complement_d'informations": return 'FILTRE.STATUT.RETOURCOMPLEMENT';
      default: return statut;
    }
  }
  setStatut(value: string) {
    this.statut = value;
    this.filterFiches();
  }

  ouvrirPopupComplement(fiche: Fiche): void {
    this.selectedFicheId = fiche.id;
    this.complementFile = null;

    const modalElement = document.getElementById('complementModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Boosted/Bootstrap non disponible ou élément introuvable.');
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.complementFile = file;
    }
  }
  envoyerComplement(): void {
    if (!this.selectedFicheId || !this.complementFile) {
      alert('Veuillez choisir un fichier à envoyer.');
      return;
    }

    const formData = new FormData();
    formData.append('complementFile', this.complementFile);

    this.ficheService.ajouterComplement(this.selectedFicheId, formData).subscribe({
      next: () => {
        //  Fermer le modal IMMÉDIATEMENT
        this.fermerModalImmediatement();

        // Afficher le message de succès après fermeture
        alert('✅ Complément envoyé avec succès.');

        // Recharger les données
        this.ngOnInit();
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur lors de l\'envoi du complément', error);
        alert("Erreur lors de l'envoi du complément.");
      }
    });
  }

// ✅ Méthode pour fermer le modal immédiatement et proprement
  private fermerModalImmediatement(): void {
    const modalElement = document.getElementById('complementModal');
    if (modalElement) {
      // Méthode 1: Utiliser Bootstrap si disponible
      if (typeof bootstrap !== 'undefined') {
        const instance = bootstrap.Modal.getInstance(modalElement);
        if (instance) {
          instance.hide();
        }
      }

      // Méthode 2: Forcer la fermeture manuellement
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
      modalElement.removeAttribute('role');


      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());


      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('overflow-x');
      document.body.style.removeProperty('overflow-y');


      document.body.style.overflow = 'visible';
      document.body.style.paddingRight = '0px';


      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('padding-right');


      document.documentElement.classList.remove('modal-open');


      setTimeout(() => {
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
        window.dispatchEvent(new Event('resize'));
      }, 100);

      // Réinitialiser les variables
      this.selectedFicheId = null;
      this.complementFile = null;

      // Réinitialiser le formulaire
      const fileInput = document.getElementById('complementFile') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  setSelectedFiche(fiche: Fiche): void {
    this.selectedFicheId = fiche.id;
    this.complementFile = null;
  }


}
