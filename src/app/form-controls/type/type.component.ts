import { Component, forwardRef, OnDestroy, Input, AfterViewInit, OnInit, Inject, LOCALE_ID } from '@angular/core';

import {
    ControlValueAccessor,
    FormControl,
    FormGroup,
    FormGroupDirective,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { getSensorTypesTranslation } from '../../model/bodies/sensorTypes';

@Component({
    selector: 'app-sensor-type',
    templateUrl: './type.component.html',
    styleUrls: ['./type.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TypeComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => TypeComponent),
            multi: true,
        },
    ],
})
export class TypeComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
    public form: FormGroup;
    public subscriptions: Subscription[] = [];

    @Input() public sensorIdx: number;
    @Input() public submitted: boolean;

    get value() {
        return this.form.value;
    }

    set value(value) {
        if (!value) {
            return;
        }
        this.form.setValue(value);
        this.onChange(value);
        this.onTouched();
    }

    public sensorTypes = getSensorTypesTranslation(this.locale);

    constructor(private rootFormGroup: FormGroupDirective, @Inject(LOCALE_ID) private locale: string) {}

    public get f() {
        return this.form.controls;
    }

    public ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    public onChange: any = () => {};
    public onTouched: any = () => {};

    public registerOnChange(fn: any) {
        this.onChange = fn;
    }

    public writeValue(value) {
        if (value) {
            this.value = value;
        }

        if (value === null) {
            this.form.reset();
            this.form.markAsPristine();
        }
        ($('.selectpicker') as any).selectpicker('refresh');
    }

    public registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    // communicate the inner form validation to the parent form
    public validate(_: FormControl) {
        return this.form.valid ? null : { typeName: { valid: false } };
    }

    ngAfterViewInit(): void {
        ($('.selectpicker') as any).selectpicker('refresh');
    }

    ngOnInit(): void {
        this.form = this.rootFormGroup.control.get(`sensors.${this.sensorIdx}`) as FormGroup;

        this.subscriptions.push(
            // any time the inner form changes update the parent of any change
            this.form.valueChanges.subscribe((value) => {
                this.onChange(value.typeName);
                this.onTouched();
            }),
        );

        ($('.selectpicker') as any).selectpicker('refresh');
    }
}
