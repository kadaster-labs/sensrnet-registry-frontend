import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DeviceComponent } from './device.component';

describe('SensorRegisterComponent', () => {
    let component: DeviceComponent;
    let fixture: ComponentFixture<DeviceComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [DeviceComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(DeviceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    xit('should create', () => {
        expect(component).toBeTruthy();
    });
});
