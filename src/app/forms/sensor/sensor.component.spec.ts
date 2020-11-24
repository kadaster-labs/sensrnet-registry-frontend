import { SensorComponent } from './sensor.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('SensorRegisterComponent', () => {
  let component: SensorComponent;
  let fixture: ComponentFixture<SensorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
