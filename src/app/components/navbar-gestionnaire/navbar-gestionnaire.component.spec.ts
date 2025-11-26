import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarGestionnaireComponent } from './navbar-gestionnaire.component';

describe('NavbarGestionnaireComponent', () => {
  let component: NavbarGestionnaireComponent;
  let fixture: ComponentFixture<NavbarGestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarGestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarGestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
