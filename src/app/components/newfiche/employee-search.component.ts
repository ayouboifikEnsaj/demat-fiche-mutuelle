import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-search',
  standalone: false,
  templateUrl: './employee-search.component.html',
  styleUrls: ['./employee-search.component.css']
})
export class EmployeeSearchComponent implements OnInit {
  searchCriteria = {
    pims: '',
    first_name: '',
    last_name: '',
    cuid: '',
    email: ''
  };

  employees: any[] = [];
  loading = false;
  searchPerformed = false;
  errorMessage: string = '';

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Nettoyer le localStorage au chargement du composant
    localStorage.removeItem('selectedEmployee');
  }

  searchEmployees(): void {
    this.loading = true;
    this.searchPerformed = true;
    this.errorMessage = '';

    // Vérifier si au moins un critère est rempli
    const hasAnyCriteria = Object.values(this.searchCriteria).some(value => value !== '');

    if (!hasAnyCriteria) {
      this.errorMessage = 'Veuillez saisir au moins un critère de recherche';
      this.loading = false;
      return;
    }

    // Filtrer les critères vides
    const filteredCriteria = Object.entries(this.searchCriteria)
      .filter(([_, value]) => value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    this.employeeService.searchEmployees(filteredCriteria).subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la recherche des collaborateurs', error);
        this.loading = false;
        this.errorMessage = 'Une erreur est survenue lors de la recherche. Veuillez réessayer.';
      }
    });
  }

  initiateForm(employee: any, formType: string): void {
    // Stocker les informations de l'employé sélectionné dans le localStorage
    localStorage.setItem('selectedEmployee', JSON.stringify(employee));

    // Rediriger vers le composant approprié en fonction du type de fiche
    switch (formType) {
      case 'medical':
        this.router.navigate(['/medical-fiche-auto']);
        break;
      case 'dentaire':
        this.router.navigate(['/dentaire-fiche-auto']);
        break;
      case 'priseEnCharge':
        this.router.navigate(['/prise-en-charge-form']);
        break;
      default:
        console.error('Type de fiche non reconnu');
    }
  }

  resetSearch(): void {
    this.searchCriteria = {
      pims: '',
      first_name: '',
      last_name: '',
      cuid: '',
      email: ''
    };
    this.employees = [];
    this.searchPerformed = false;
    this.errorMessage = '';
  }
}
