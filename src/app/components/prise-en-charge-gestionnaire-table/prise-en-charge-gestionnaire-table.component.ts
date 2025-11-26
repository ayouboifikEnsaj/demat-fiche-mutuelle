// src/app/components/prise-en-charge-gestionnaire-table/prise-en-charge-gestionnaire-table.component.ts
import { Component, OnInit } from '@angular/core';
import { PriseEnCharge } from '../../models/PriseEnCharge';
import { PriseEnChargeService } from '../../services/prise-en-charge.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prise-en-charge-gestionnaire-table',
  standalone: false,
  templateUrl: './prise-en-charge-gestionnaire-table.component.html',
  styleUrls: ['./prise-en-charge-gestionnaire-table.component.css']
})
export class PriseEnChargeGestionnaireTableComponent implements OnInit {
  priseEnCharges: PriseEnCharge[] = [];
  filteredPriseEnCharges: PriseEnCharge[] = [];

  dateSoumission: string = '';
  motif: string = '';
  statut: string = '';
  nomEmploye: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;

  get paginatedPriseEnCharges(): PriseEnCharge[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPriseEnCharges.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPriseEnCharges.length / this.itemsPerPage);
  }

// Suite du fichier src/app/components/prise-en-charge-gestionnaire-table/prise-en-charge-gestionnaire-table.component.ts
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
    private translateService: TranslateService,
    private router: Router
  ) {
    this.initTranslateService();
  }

  ngOnInit(): void {
    this.loadPriseEnCharges();
  }

  loadPriseEnCharges(): void {
    this.priseEnChargeService.getAllPriseEnCharges().subscribe(data => {
      this.priseEnCharges = data;
      this.filterPriseEnCharges();
      console.log("✅ Prises en charge reçues :", this.priseEnCharges);
    });
  }

  filterPriseEnCharges(): void {
    const expectedStatut = this.statutMap[this.statut];

    let filtered = this.priseEnCharges.filter(priseEnCharge => {
      const matchDateSoum = !this.dateSoumission || priseEnCharge.dateSoumission?.startsWith(this.dateSoumission);
      const matchMotif = !this.motif || priseEnCharge.motif?.toLowerCase().includes(this.motif.toLowerCase());
      const matchStatut = !this.statut || priseEnCharge.statutPriseEnCharge === expectedStatut;

      const employeFullName = `${priseEnCharge.employee?.firstName || ''} ${priseEnCharge.employee?.lastName || ''}`.toLowerCase();
      const matchNom = !this.nomEmploye || employeFullName.includes(this.nomEmploye.toLowerCase());

      return matchDateSoum && matchMotif && matchStatut && matchNom;
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
      case 'validée_par_rh': return 'FILTRE.STATUT.VALIDEE';
      case 'Rejete': return 'FILTRE.STATUT.REJETEE';
      case "Retour_complement_d'informations": return 'FILTRE.STATUT.RETOURCOMPLEMENT';
      case "en_cour_de_traitement_par_assurance": return 'FILTRE.STATUT.ENCOURSTRAITEMENT.PRISE';
      case "accorder": return 'FILTRE.STATUT.ACCORDER.PRISE';
      default: return statut;
    }
  }

  // Méthode pour créer une prise en charge pour un employé absent
  creerPriseEnChargeAbsent(): void {
    this.router.navigate(['/recherche-employe']);
  }

  // Méthode pour exporter les données en CSV
  exporterCSV(): void {
    // Créer les en-têtes du CSV
    const headers = ['Nom', 'Prénom', 'Motif', 'Date', 'Statut', 'Montant'];

    // Créer les lignes de données
    const rows = this.filteredPriseEnCharges.map(p => [
      p.employee?.lastName || '',
      p.employee?.firstName || '',
      p.motif || '',
      p.dateSoumission ? new Date(p.dateSoumission).toLocaleDateString() : '',
      this.getStatutKey(p.statutPriseEnCharge || ''),
      `${p.montant || 0} MAD`
    ]);

    // Combiner les en-têtes et les lignes
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Créer un objet Blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prises-en-charge-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

