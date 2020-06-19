import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorUpdateComponent } from './sensor-update.component';

describe('SensorUpdateComponent', () => {
  let component: SensorUpdateComponent;
  let fixture: ComponentFixture<SensorUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
