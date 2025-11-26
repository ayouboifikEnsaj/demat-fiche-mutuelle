import { Component } from '@angular/core';
import { FicheService } from '../../services/fiche.service';
import { FichePayload } from '../../models/Fiche';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-fiche-dentaire-form',
  standalone: false,
  templateUrl: './fiche-dentaire-form.component.html',
  styleUrls: ['./fiche-dentaire-form.component.css']
})
export class FicheDentaireFormComponent {
  fileURL: SafeResourceUrl | null = null;
  popupVisible = false;
  currentSection: string = '';
  actesType: string = '';
  selectedFile: File | null = null;
  numDossier: string = '';
  lieuDepot: string = 'Casablanca';
  qrCodeList: string[] = [];
  selectedPatient: string = 'Lui_Meme';
  invalidIndexes: number[] = [];
  previousRowsBackup: any[] = [];

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

  getSelectedDate(): string {
    const input = document.getElementById('dateconsultation') as HTMLInputElement;
    return input?.value;
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

  showSuccessModal = false;
  showErrorModal = false;
  submitFicheDentaire() {
    const user = this.authService.getUser();
    if (!user) {
      alert('Utilisateur non connecté.');
      return;
    }
    const employeId = user.id;

    if (!this.selectedFile) {
      alert('Veuillez joindre un fichier PDF.');
      return;
    }

    if (!this.qrCodeList || this.qrCodeList.length === 0) {
      alert("Aucun QR Code valide détecté.");
      return;
    }

    if (!this.numDossier || !this.qrCodeList.includes(this.numDossier)) {
      alert("Le numéro de dossier est vide ou invalide.");
      return;
    }

    const actions = this.sections
      .map(section => ({
        typeAction: this.mapSectionToAction(section.id),
        detailsActions: section.rows
          .filter(row => row.date && row.amount > 0)
          .map(row => ({
            dateAction: row.date,
            montant: row.amount,
            typeDocument: row.typeDocument ?? 'Facture'
          }))
      }))
      .filter(action => action.detailsActions.length > 0);

    if (actions.length === 0) {
      alert('Aucune ligne valide trouvée.');
      return;
    }

    const fiche: FichePayload = {
      numDossier: this.numDossier,
      dateConsultation: this.getSelectedDate(),
      typeFiche: 'Dentaire',
      typePatient: this.selectedPatient,
      lieuDepot: this.lieuDepot,
      actions
    };

    this.ficheService.createFiche(fiche, employeId, this.selectedFile).subscribe({
      next: () => {
        this.showSuccessModal = true;
        this.resetForm();
      },
      error: err => {
        console.error(err);
        this.showErrorModal = true;
      }
    });

  }
  closeModal() {
    this.showSuccessModal = false;
    this.router.navigate(['/employes-home']);
  }

  closeErrorModal() {
    this.showErrorModal = false;
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
    this.fileURL = null;
    this.numDossier = '';
    this.qrCodeList = [];
    this.selectedPatient = 'Lui_Meme';
    this.dateAmountRows = [];
    this.popupVisible = false;
    this.currentSection = '';
    (document.getElementById('dateconsultation') as HTMLInputElement).value = '';
    (document.getElementById('patient') as HTMLSelectElement).value = 'Lui_Meme';
    (document.getElementById('inputGroupFile04') as HTMLInputElement).value = '';
    (document.getElementById('dossier') as HTMLInputElement).value = '';
  }

  openPopup(sectionId: string) {
    if (this.currentSection === sectionId) {
      this.closePopup(true);
      return;
    }

    const section = this.sections.find(s => s.id === sectionId);
    if (!section) return;

    const needsTypeDoc = sectionId === 'soins' || sectionId === 'prothese';
    if (section.rows.length === 0) {
      section.rows = [
        { date: '', amount: 0, ...(needsTypeDoc ? { typeDocument: 'facture' } : {}) }
      ];
    }

    this.previousRowsBackup = JSON.parse(JSON.stringify(section.rows));
    this.dateAmountRows = JSON.parse(JSON.stringify(section.rows));
    this.popupVisible = true;
    this.currentSection = sectionId;
    this.invalidIndexes = [];
  }

  closePopup(fromChevron: boolean) {
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
    if (pos !== -1) {
      this.invalidIndexes.splice(pos, 1);
    }
  }

  addDateAmountRow() {
    const needsTypeDoc = this.currentSection === 'soins' || this.currentSection === 'prothese';
    this.dateAmountRows.push({
      date: '',
      amount: 0,
      ...(needsTypeDoc ? { typeDocument: 'facture' } : {})
    });
  }

  removeRow(index: number) {
    const confirmation = confirm("Voulez-vous vraiment supprimer cette ligne ?");
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
  removeFile() {
    this.selectedFile = null;
    this.fileURL = null;
    this.qrCodeList = [];
    this.numDossier = '';
    const input = document.getElementById('inputGroupFile04') as HTMLInputElement;
    if (input) input.value = '';
  }
  shouldShowValidateButton(): boolean {
    return this.dateAmountRows.some(row => row.date && row.amount > 0);
  }



}
