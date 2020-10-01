import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorRegisterComponent } from './sensor-register.component';

describe('SensorRegisterComponent', () => {
  let component: SensorRegisterComponent;
  let fixture: ComponentFixture<SensorRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorRegisterComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
