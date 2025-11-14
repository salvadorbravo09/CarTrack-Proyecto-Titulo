import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainNavVehiculoComponent } from './main-nav-vehiculo.component';

describe('MainNavVehiculoComponent', () => {
  let component: MainNavVehiculoComponent;
  let fixture: ComponentFixture<MainNavVehiculoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainNavVehiculoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainNavVehiculoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
