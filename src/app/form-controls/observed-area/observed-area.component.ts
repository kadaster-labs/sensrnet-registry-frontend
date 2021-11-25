import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import GeometryType from 'ol/geom/GeometryType';
import { Subscription } from 'rxjs';
import { IDevice } from '../../model/bodies/device-model';
import { DrawOption } from '../../model/bodies/draw-options';
import { DeviceService } from '../../services/device.service';
import { LocationService } from '../../services/location.service';
import { ObservedAreaService } from '../../services/observed-area.service';

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

    private deviceLocation: number[];

    @Input() public submitted: boolean;

    @Input() set device(device: IDevice) {
        if (device) {
            this.deviceLocation = device.location.coordinates;
        }
    }

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
        private readonly deviceService: DeviceService,
        private readonly locationService: LocationService,
        private readonly observedAreaService: ObservedAreaService,
    ) {
        this.form = this.formBuilder.group({
            type: null,
            radius: null,
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
                    this.form.setValue({
                        type: 'Circle',
                        radius: location.properties.radius,
                    });

                    this.setSelectLocation(false);
                }
            }),
        );
    }

    public setSelectLocation(selectLocation): void {
        this.selectLocation = selectLocation;

        if (selectLocation) {
            this.observedAreaService.hideObservedAreas();

            const drawOption = { variant: GeometryType.CIRCLE, center: this.deviceLocation } as DrawOption;
            this.locationService.enableDraw(drawOption);
        } else {
            this.locationService.disableDraw();

            const observedAreas = {
                center: this.deviceLocation,
                observedAreas: [
                    {
                        radius: this.form.value.radius,
                    },
                ],
            };
            this.observedAreaService.showObservedAreas(observedAreas);
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
