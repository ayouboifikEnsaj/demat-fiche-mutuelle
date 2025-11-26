import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployesHomeComponent } from './employes-home.component';

describe('EmployesHomeComponent', () => {
  let component: EmployesHomeComponent;
  let fixture: ComponentFixture<EmployesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployesHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
