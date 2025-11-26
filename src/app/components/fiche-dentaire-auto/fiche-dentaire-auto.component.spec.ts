import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheDentaireAutoComponent } from './fiche-dentaire-auto.component';

describe('FicheDentaireAutoComponent', () => {
  let component: FicheDentaireAutoComponent;
  let fixture: ComponentFixture<FicheDentaireAutoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FicheDentaireAutoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheDentaireAutoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
