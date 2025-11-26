import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployesTableComponent } from './employes-table.component';

describe('EmployesTableComponent', () => {
  let component: EmployesTableComponent;
  let fixture: ComponentFixture<EmployesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
