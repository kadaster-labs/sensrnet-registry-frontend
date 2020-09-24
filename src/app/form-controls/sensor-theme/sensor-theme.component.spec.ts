import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorThemeComponent } from './sensor-theme.component';

describe('SensorThemeComponent', () => {
  let component: SensorThemeComponent;
  let fixture: ComponentFixture<SensorThemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorThemeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
