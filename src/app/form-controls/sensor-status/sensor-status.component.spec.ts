import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SensorStatusComponent } from './sensor-status.component';

describe('SensorStatusComponent', () => {
  let component: SensorStatusComponent;
  let fixture: ComponentFixture<SensorStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
