import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorTypeComponent } from './sensor-type.component';

describe('SensorTypeComponent', () => {
  let component: SensorTypeComponent;
  let fixture: ComponentFixture<SensorTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
