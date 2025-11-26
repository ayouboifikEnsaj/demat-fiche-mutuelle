import {Component, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {FicheService} from '../../services/fiche.service';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FichePayload} from '../../models/Fiche';

@Component({
  selector: 'app-fiche-dentaire-auto',
  standalone: false,
  templateUrl: './fiche-dentaire-auto.component.html',
  styleUrl: './fiche-dentaire-auto.component.css'
})
export class FicheDentaireAutoComponent implements  OnInit{
  selectedEmployee: any = null;
  fileURL: SafeResourceUrl | null = null;
  selectedFile: File | null = null;
  qrCodeList: string[] = [];
  numDossier: string = '';

  // Sélection CUID
  cuidList: string[] = [];
  selectedCuid: string = '';
  searchText = '';
  filteredCuids: string[] = [];
  showList = false;

  // Champs généraux
  selectedPatient: string = 'Lui_Meme';
  selectedMaladieType: string = '';
  lieuDepot: string = 'Casablanca';

  //Affichage et cloture des PopUp des sections
  popupVisible = false;
  currentSection: string = '';
  actesType: string = '';
  invalidIndexes: number[] = [];
  showSuccessModal = false;
  showErrorModal = false;

  ngOnInit() {
    // Récupérer l'employé sélectionné depuis le localStorage
    const employeeData = localStorage.getItem('selectedEmployee');

    if (employeeData) {
      this.selectedEmployee = JSON.parse(employeeData);
      console.log('Employé sélectionné:', this.selectedEmployee);

      // Pré-remplir le champ CUID avec celui de l'employé sélectionné
      if (this.selectedEmployee.cuid) {
        this.selectedCuid = this.selectedEmployee.cuid;
        this.searchText = this.selectedEmployee.cuid;

        // Désactiver la recherche de CUID puisqu'on a déjà l'employé
        this.showList = false;
      }

      // Charger les CUIDs uniquement si nécessaire (pour la validation)
      this.loadCuids();
    } else {
      // Si aucun employé n'est sélectionné, charger tous les CUIDs pour la recherche
      this.loadCuids();
      this.filteredCuids = this.cuidList;
    }
  }
  isCuidValid(): boolean {
    // Si un employé est sélectionné, son CUID est considéré comme valide
    if (this.selectedEmployee) {
      return true;
    }
    // Sinon, vérifier si le CUID saisi existe dans la liste
    return this.cuidList.includes(this.selectedCuid);
  }

  onSearchChange(): void {
    const q = this.searchText.trim().toUpperCase();

    // Filtrer
    this.filteredCuids = q
      ? this.cuidList.filter(c => c.toUpperCase().includes(q))
      : [];

    // Afficher/masquer la liste
    this.showList = this.filteredCuids.length > 0;

    // Si on a tout effacé, on ferme aussi
    if (!q) this.showList = false;
  }
  selectCuid(cuid: string): void {
    this.selectedCuid = cuid;
    this.searchText = cuid;      // remplir l’input avec le choix
    this.filteredCuids = [];
    this.showList = false;       // fermer la liste
  }
  onSearchBlur(): void {
    setTimeout(() => this.showList = false, 120);
  }

  onSearchKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape') {
      this.showList = false;
    }
  }
  sections = [
    {
      id: 'soins',
      translationKey: 'TYPE_ACTION.Soins_dentaires',
      total: 0,
      rows: [] as { date: string; amount: number; typeDocument?: string }[]
    },
    {
      id: 'prothese',
      translationKey: 'TYPE_ACTION.Prothése_et_orthodonie',
      total: 0,
      rows: [] as { date: string; amount: number; typeDocument?: string }[]
    },
    {
      id: 'analyses',
      translationKey: 'TYPE_ACTION.Pharmacie_analyses_radiographies',
      total: 0,
      rows: [] as { date: string; amount: number; typeDocument?: string }[]
    },
    {
      id: 'pharmadentaire',
      translationKey: 'TYPE_ACTION.Pharmacie_et_soins_dentaires',
      total: 0,
      rows: [] as { date: string; amount: number; typeDocument?: string }[]
    }
  ];
  dateAmountRows: { date: string; amount: number; typeDocument?: string }[] = [];
  constructor(
    private ficheService: FicheService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
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
  loadCuids(): void {
    this.ficheService.getAllCuids().subscribe({
      next: (cuids) => this.cuidList = cuids ?? [],
      error: (err) => console.error('Erreur chargement CUIDs:', err)
    });
  }
  switchLang(lang: string): void {
    this.translateService.use(lang);
    localStorage.setItem('lang', lang);
  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile && this.selectedFile.type === 'application/pdf') {
      this.fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(this.selectedFile)
      );
      this.qrCodeList = [];
      this.numDossier = '';

      this.ficheService.decodeAllQRCodes(this.selectedFile).subscribe({
        next: (codes: string[]) => {
          if (!codes || codes.length === 0) {
            alert("Aucun QR Code détecté dans le fichier.");
            return;
          }
          this.qrCodeList = codes;
          this.numDossier = codes[0] || '';
          const input = document.getElementById('dossier') as HTMLInputElement;
          if (input) input.value = this.numDossier;
        },
        error: err => {
          console.error('Erreur QR Code :', err);
          this.numDossier = '';
          alert('Erreur lors de la lecture du QR code.');
        }
      });
    } else {
      this.fileURL = null;
      this.qrCodeList = [];
      this.numDossier = '';
      alert("Veuillez sélectionner un fichier PDF.");
    }
  }
  mapSectionToAction(sectionId: string): string {
    const mapping: Record<string, string> = {
      soins: 'Soins_dentaires',
      prothese: 'Prothése_et_orthodonie',
      analyses: 'Pharmacie_analyses_radiographies',
      pharmadentaire: 'Pharmacie_et_soins_dentaires'
    };
    return mapping[sectionId];
  }
  openPopup(sectionId: string) {
    if (this.popupVisible && this.currentSection === sectionId) {
      this.closePopup(true);
      return;
    }
    this.popupVisible = true;
    this.currentSection = sectionId;

    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    if (section.rows.length === 0) {
      section.rows = [
        { date: '', amount: 0, typeDocument: sectionId === 'actes' ? this.actesType || 'facture' : undefined }
      ];
    }

    this.dateAmountRows = [...section.rows];
  }
  closePopup(fromChevron: boolean = false) {
    this.invalidIndexes = [];
    const section = this.sections.find(s => s.id === this.currentSection);
    if (!section) return;

    if (fromChevron) {
      this.dateAmountRows = [];
      this.popupVisible = false;
      this.currentSection = '';
      return;
    }

    this.dateAmountRows.forEach((row, i) => {
      const hasDate = !!row.date;
      const hasAmount = row.amount && row.amount > 0;
      if ((hasDate && !hasAmount) || (!hasDate && hasAmount)) {
        this.invalidIndexes.push(i);
      }
    });

    if (this.invalidIndexes.length > 0) {
      return;
    }

    const validRows = this.dateAmountRows.filter(row => row.date && row.amount > 0);
    section.rows = [...validRows];
    section.total = this.calculateTotal(validRows);
    this.dateAmountRows = [];
    this.popupVisible = false;
    this.currentSection = '';
  }

  clearInvalid(index: number) {
    const pos = this.invalidIndexes.indexOf(index);
    if (pos !== -1) this.invalidIndexes.splice(pos, 1);
  }
  addDateAmountRow() {
    this.dateAmountRows.push({
      date: '',
      amount: 0,
      typeDocument: this.currentSection === 'actes' ? this.actesType || 'facture' : undefined
    });
  }

  removeRow(index: number) {
    const confirmation = confirm('Voulez-vous vraiment supprimer cette ligne ?');
    if (confirmation) {
      this.dateAmountRows.splice(index, 1);
      this.updateTotal();
    }
  }

  updateTotal() {
    const section = this.sections.find(s => s.id === this.currentSection);
    if (!section) return;
    section.total = this.calculateTotal(this.dateAmountRows);
  }

  calculateTotal(rows: { date: string; amount: number }[]): number {
    return rows.reduce((sum, row) => sum + Number(row.amount), 0);
  }
  get montantGlobal(): number {
    return this.sections.reduce((total, section) => total + section.total, 0);
  }
  resetForm() {
    this.sections.forEach(section => {
      section.rows = [];
      section.total = 0;
    });
    this.selectedFile = null;
    this.numDossier = '';
    this.qrCodeList = [];
    this.selectedPatient = 'Lui_Meme';
    this.dateAmountRows = [];
    this.popupVisible = false;
    this.currentSection = '';
    this.invalidIndexes = [];
    (document.getElementById('dateconsultation') as HTMLInputElement).value = '';
    (document.getElementById('patient') as HTMLSelectElement).value = 'Lui_Meme';
    (document.getElementById('inputGroupFile04') as HTMLInputElement).value = '';
    (document.getElementById('dossier') as HTMLInputElement).value = '';
    this.selectedCuid = '';
  }
  changeEmployee() {
    // Nettoyer les données de l'employé sélectionné
    localStorage.removeItem('selectedEmployee');
    this.selectedEmployee = null;
    this.selectedCuid = '';
    this.searchText = '';

    // Rediriger vers la page de recherche d'employé
    this.router.navigate(['/search-employee']);
  }

  submitFicheDentaireeByCuid() {
    const cuidToUse = this.selectedEmployee ? this.selectedEmployee.cuid : this.selectedCuid;

    if (!cuidToUse) {
      alert('Veuillez sélectionner un CUID.');
      return;
    }

    const file = this.selectedFile;
    if (!file) {
      alert('Veuillez sélectionner un fichier PDF.');
      return;
    }

    if (!this.qrCodeList || this.qrCodeList.length === 0) {
      alert('🚫 Aucun QR Code valide détecté dans le fichier PDF.');
      return;
    }

    if (!this.numDossier || !this.qrCodeList.includes(this.numDossier)) {
      alert('❌ Le numéro de dossier saisi ne correspond à aucun QR Code détecté.');
      return;
    }

    const actions = this.sections
      .map(section => ({
        typeAction: this.mapSectionToAction(section.id),
        detailsActions: section.rows
          .filter(row => row.date && row.amount > 0)
          .map(row => ({
            dateAction: row.date,
            typeDocument: row.typeDocument || 'Facture',
            montant: row.amount
          }))
      }))
      .filter(action => action.detailsActions.length > 0);

    if (actions.length === 0) {
      alert('Veuillez remplir au moins une action avec un montant et une date.');
      return;
    }

    const payload: FichePayload = {
      numDossier: this.numDossier,
      dateConsultation: (document.getElementById('dateconsultation') as HTMLInputElement)?.value,
      typeFiche: 'Dentaire',
      typePatient: this.selectedPatient,
      lieuDepot: this.lieuDepot,
      actions
    };

    this.ficheService.createFicheByCuid(payload, this.selectedCuid, file).subscribe({
      next: () => {

        localStorage.removeItem('selectedEmployee');
        this.showSuccessModal = true;
        this.resetForm();
      },
      error: err => {
        console.error('Erreur :', err);
        this.showErrorModal = true;
      }
    });
  }


  closeModal() {
    this.showSuccessModal = false;
    this.router.navigate(['/gestionnaire-home']);
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }
  shouldShowValidateButton(): boolean {
    return this.dateAmountRows.some(row => row.date && row.amount > 0);
  }
  removeFile() {
    this.selectedFile = null;
    this.fileURL = null;
    this.qrCodeList = [];
    this.numDossier = '';
    const input = document.getElementById('inputGroupFile04') as HTMLInputElement;
    if (input) input.value = '';
  }

}
