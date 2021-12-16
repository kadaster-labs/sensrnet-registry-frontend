import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { unitOfMeasurementTypes } from '../../model/bodies/unitOfMeasurements';

export interface UnitOfMeasurementFormValues {
    name: string;
    symbol: string;
}

@Component({
    selector: 'app-unit-of-measurement',
    templateUrl: './unit-of-measurement.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UnitOfMeasurementComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => UnitOfMeasurementComponent),
            multi: true,
        },
    ],
})
export class UnitOfMeasurementComponent implements ControlValueAccessor, OnDestroy {
    public form: FormGroup;
    public subscriptions: Subscription[] = [];

    @Input() public submitted: boolean;

    get f() {
        return this.form.controls;
    }

    get value(): UnitOfMeasurementFormValues {
        return this.form.value;
    }

    set value(value: UnitOfMeasurementFormValues) {
        if (!value) {
            return;
        }
        this.form.setValue(value);
        this.onChange(value);
        this.onTouched();
    }

    constructor(private readonly formBuilder: FormBuilder) {
        this.form = this.formBuilder.group({
            name: null,
            symbol: null,
        });

        this.subscriptions.push(
            // any time the inner form changes update the parent of any change
            this.form.valueChanges.subscribe((value) => {
                this.onChange(value);
                this.onTouched();
            }),
        );
    }

    public onChange: any = () => {};
    public onTouched: any = () => {};

    public registerOnChange(fn: any) {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    public writeValue(value: UnitOfMeasurementFormValues) {
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

    formatUnitOfMeasurement(unitOfMeasurement: Record<string, any>) {
        return `${unitOfMeasurement.name} (${unitOfMeasurement.symbol})`;
    }

    setUnitOfMeasurement($e) {
        $e.preventDefault();

        this.form.patchValue($e.item);
    }

    searchName = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map((x) => unitOfMeasurementTypes.filter((y) => y.name.toLowerCase().startsWith(x))),
        );

    searchSymbol = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map((x) => unitOfMeasurementTypes.filter((y) => y.symbol.toLowerCase().startsWith(x))),
        );
}
