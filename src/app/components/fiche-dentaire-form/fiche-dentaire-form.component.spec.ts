import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheDentaireFormComponent } from './fiche-dentaire-form.component';

describe('FicheDentaireFormComponent', () => {
  let component: FicheDentaireFormComponent;
  let fixture: ComponentFixture<FicheDentaireFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FicheDentaireFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FicheDentaireFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
