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
import { ISensorLocation } from '../../model/bodies/location';
import { LocationService } from '../../services/location.service';

export interface SensorLocationFormValues {
    latitude: number;
    longitude: number;
    height: number;
}

@Component({
    selector: 'app-observed-area',
    templateUrl: './observed-area.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ObservedAreaComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => ObservedAreaComponent),
            multi: true,
        },
    ],
})
export class ObservedAreaComponent implements ControlValueAccessor, OnDestroy {
    public form: FormGroup;
    public subscriptions: Subscription[] = [];

    public selectLocation = false;

    private location: ISensorLocation;

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

    constructor(private readonly locationService: LocationService, private readonly formBuilder: FormBuilder) {
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

                    this.locationService.showLocation(this.location);
                    this.setSelectLocation(false);
                }
            }),
        );
    }

    public setSelectLocation(selectLocation): void {
        this.selectLocation = selectLocation;

        if (selectLocation) {
            this.locationService.enableDraw(GeometryType.POINT);
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
