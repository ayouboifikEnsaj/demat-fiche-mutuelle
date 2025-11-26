import { Component, OnInit } from '@angular/core';
import { Fiche } from '../../models/Fiche';
import { EmployeeResponse } from '../../models/employeresponse';
import { FicheService } from '../../services/fiche.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-gestionnaire-table',
  standalone: false,
  templateUrl: './gestionnaire-table.component.html',
  styleUrl: './gestionnaire-table.component.css'
})
export class GestionnaireTableComponent implements OnInit {
  fiches: Fiche[] = [];
  filteredFiches: Fiche[] = [];
  user: EmployeeResponse | null = null;
  selectedFiche: Fiche | null = null;
  exportStartDate: string = '';
  exportEndDate: string = '';
  exportLieuDepot: string | null = null;
  exportTypeFiche: string | null = null;
  lieuxDepot: string[] = ['CASABLANCA', 'RABAT'];
  typesFiche: string[] = ['DENTAIRE', 'OPTIQUE', 'MALADIE', 'MATERNITE', 'TRAITEMENT_SPECIAUX'];

  // Champs de filtre
  dateConsultation: string = '';
  dateSoumission: string = '';
  numDossier: string = '';
  statut: string = 'ENATTENTE'; // Par défaut afficher les fiches en attente

  autoOpenEnabled: boolean = true;
  private lastInputTime: number = 0;
  private inputTimeout: any = null;
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 7;

  get paginatedFiches(): Fiche[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFiches.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFiches.length / this.itemsPerPage);
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

  // Mapping Angular -> Backend
  statutMap: { [key: string]: string } = {
    ENATTENTE: 'En_attente',
    VALIDEE: 'Validee',
    REJETEE: 'Rejete',
    RETOURCOMPLEMENT: "Retour_complement_d'informations"
  };


  constructor(
    private ficheService: FicheService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.initTranslateService();
  }
  initTranslateService(): void {
    this.translateService.addLangs(['fr', 'en']);
    this.translateService.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang');
    const langToUse = savedLang || 'en';
    this.translateService.use(langToUse);
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user) {
      console.warn("Utilisateur non connecté. Redirection...");
      this.router.navigate(['/login']);
      return;
    }

    this.ficheService.getAllFiches().subscribe({
      next: (data) => {
        this.fiches = data;
        this.filterFiches();
      },
      error: (err) => console.error('Erreur lors du chargement des fiches', err)
    });
  }

  formatStatut(statut: string): string {
    switch (statut) {
      case 'En_attente': return 'En attente';
      case 'Validee': return 'Validée';
      case 'Rejete': return 'Rejetée';
      case "Retour_complement_d'informations": return "Compléments d'informations";
      default: return statut;
    }
  }
  onNumDossierChange(event: any): void {
    // Filtrer les fiches comme avant
    this.filterFiches();

    if (!this.autoOpenEnabled) return;

    // Annuler tout timeout précédent
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
    }

    // Enregistrer le temps de la dernière saisie
    this.lastInputTime = Date.now();

    // Définir un nouveau timeout pour vérifier si la saisie est terminée
    this.inputTimeout = setTimeout(() => {
      // Si aucune nouvelle saisie n'a été faite depuis 500ms, considérer que la saisie est terminée
      if (Date.now() - this.lastInputTime >= 500 && this.numDossier.trim().length > 0) {
        this.openMatchingFiche();
      }
    }, 500);
  }
  openMatchingFiche(): void {
    // Rechercher une fiche correspondant exactement au numéro de dossier
    const matchingFiche = this.fiches.find(fiche =>
      fiche.numDossier && fiche.numDossier.toLowerCase() === this.numDossier.toLowerCase()
    );

    if (matchingFiche) {
      console.log('Fiche trouvée, ouverture automatique:', matchingFiche);
      // Naviguer vers la page de détails
      this.router.navigate(['/fiche-gestionnaire', matchingFiche.id]);
    }
  }
  filterFiches(): void {
    const expectedStatut = this.statutMap[this.statut];

    this.filteredFiches = this.fiches.filter(fiche => {
      const matchDateConsult = !this.dateConsultation || fiche.dateConsultation?.startsWith(this.dateConsultation);
      const matchDateSoum = !this.dateSoumission || fiche.dateSoumission?.startsWith(this.dateSoumission);
      const matchDossier = !this.numDossier || fiche.numDossier?.toLowerCase().includes(this.numDossier.toLowerCase());
      const matchStatut = !this.statut || fiche.statutFiche === expectedStatut;

      return matchDateConsult && matchDateSoum && matchDossier && matchStatut;
    });
    this.filteredFiches.sort((a, b) => {
      if (a.dateSoumission && b.dateSoumission) {
        return new Date(b.dateSoumission).getTime() - new Date(a.dateSoumission).getTime();
      }
      return 0;
    });

    this.currentPage = 1;
  }


  exportFiches(): void {
    if (!this.exportStartDate || !this.exportEndDate) {
      alert("Veuillez sélectionner une période valide.");
      return;
    }
    this.ficheService.exportFiches(this.exportStartDate, this.exportEndDate, this.exportLieuDepot!, this.exportTypeFiche!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export_fiches.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error("Erreur lors de l'exportation :", err);
        alert("Une erreur est survenue pendant l'export.");
      }
    });
  }

}
