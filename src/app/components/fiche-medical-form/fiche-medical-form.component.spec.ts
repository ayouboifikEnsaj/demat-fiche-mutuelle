import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheMedicalFormComponent } from './fiche-medical-form.component';

describe('FicheMedicalFormComponent', () => {
  let component: FicheMedicalFormComponent;
  let fixture: ComponentFixture<FicheMedicalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FicheMedicalFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheMedicalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
