import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheMedicalAutoComponent } from './fiche-medical-auto.component';

describe('FicheMedicalAutoComponent', () => {
  let component: FicheMedicalAutoComponent;
  let fixture: ComponentFixture<FicheMedicalAutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FicheMedicalAutoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheMedicalAutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
