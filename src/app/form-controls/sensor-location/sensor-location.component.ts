import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    Validators,
} from '@angular/forms';
import GeometryType from 'ol/geom/GeometryType';
import { Subscription } from 'rxjs';
import { IDevice } from '../../model/bodies/device-model';
import { DrawOption } from '../../model/bodies/draw-options';
import { ISensorLocation } from '../../model/bodies/location';
import { AlertService } from '../../services/alert.service';
import { LocationService } from '../../services/location.service';

export interface SensorLocationFormValues {
    latitude: number;
    longitude: number;
    height: number;
}

@Component({
    selector: 'app-sensor-location',
    templateUrl: './sensor-location.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SensorLocationComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => SensorLocationComponent),
            multi: true,
        },
    ],
})
export class SensorLocationComponent implements ControlValueAccessor, OnDestroy {
    public form: FormGroup;
    public subscriptions: Subscription[] = [];

    private location: ISensorLocation;

    public selectLocation = false;
    public observationAreaString = $localize`:@@location.area:The device has observation area's. These will be removed 
    when the location is updated.`;

    @Input() public device: IDevice;
    @Input() public submitted: boolean;

    get f() {
        return this.form.controls;
    }

    get value(): SensorLocationFormValues {
        return this.form.value;
    }

    set value(value: SensorLocationFormValues) {
        if (!value) {
            return;
        }
        this.form.setValue(value);
        this.onChange(value);
        this.onTouched();
    }

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly alertService: AlertService,
        private readonly locationService: LocationService,
    ) {
        this.form = this.formBuilder.group({
            height: [0, Validators.required],
            latitude: [null, Validators.required],
            longitude: [null, Validators.required],
        });

        this.subscriptions.push(
            // any time the inner form changes update the parent of any change
            this.form.valueChanges.subscribe((value) => {
                this.onChange(value);
                this.onTouched();
            }),
        );

        this.subscriptions.push(
            this.locationService.drawGeometry$.subscribe((location: Record<string, any>) => {
                if (this.selectLocation === true) {
                    this.location = {
                        type: 'Point',
                        coordinates: location.geometry.coordinates,
                    };

                    this.form.setValue({
                        latitude: this.location.coordinates[0],
                        longitude: this.location.coordinates[1],
                        height: this.form.get('height').value,
                    });

                    this.setSelectLocation(false);
                    this.locationService.showLocation(this.location);
                }
            }),
        );
    }

    public hasObservationAreas() {
        let result;
        if (this.device && this.device.datastreams && this.device.datastreams.length) {
            const observationAreas = this.device.datastreams.map((x) => x.observationArea).filter(Boolean);
            result = observationAreas.length > 0;
        } else {
            result = false;
        }

        return result;
    }

    public setSelectLocation(selectLocation): void {
        this.selectLocation = selectLocation;

        if (selectLocation) {
            if (this.hasObservationAreas()) {
                this.alertService.warning(this.observationAreaString);
            }
            const drawOption: DrawOption = { variant: GeometryType.POINT, center: null };
            this.locationService.enableDraw(drawOption);
        } else {
            this.locationService.disableDraw();
        }
    }

    public onChange: any = () => {};
    public onTouched: any = () => {};

    public registerOnChange(fn: any) {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    public writeValue(value: SensorLocationFormValues) {
        if (value) {
            this.value = value;
        }
    }

    // communicate the inner form validation to the parent form
    public validate(_: FormControl) {
        return this.form.valid ? null : { location: { valid: false } };
    }

    public ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }
}
