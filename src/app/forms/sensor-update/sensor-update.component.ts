import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ISensor } from '../../model/bodies/sensor-body';
import { AlertService } from '../../services/alert.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { IUpdateSensorBody, SensorService } from '../../services/sensor.service';

@Component({
  selector: 'app-sensor-update',
  templateUrl: './sensor-update.component.html',
  styleUrls: ['./sensor-update.component.scss'],
})
export class SensorUpdateComponent implements OnInit, OnDestroy {
  public sensor: ISensor;

  public submitted = false;
  public activeStepIndex = 0;

  public form: FormGroup;
  public subscriptions: Subscription[] = [];
  public formControlSteps: Record<string, Array<any>>;

  public urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly sensorService: SensorService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public setName(item: string) {
    this.form.controls.name.setValue(item);
  }

  public goToStep(step: number): void {
    if (Object.values(this.formControlSteps)[this.activeStepIndex].some((f) => f.invalid)) {
      if (step <= this.activeStepIndex) {
        this.activeStepIndex = step;
      } else {
        this.submitted = true;
      }
    } else {
      this.submitted = false;
      this.activeStepIndex = step;
    }
  }

  public getStepCount(): number {
    return Object.keys(this.formControlSteps).length;
  }

  public getStepLabel(): string {
    return Object.keys(this.formControlSteps)[this.activeStepIndex];
  }

  public getStepClasses(pageIndex: number) {
    return { active: this.activeStepIndex === pageIndex, finished: this.activeStepIndex > pageIndex };
  }

  public setSensor(sensor: ISensor): void {
    this.sensor = sensor;

    this.form.patchValue({
      name: this.sensor.name || '',
      aim: this.sensor.aim || '',
      description: this.sensor.description || '',
      manufacturer: this.sensor.manufacturer || '',
      active: { value: this.sensor.active.toString() || false },
      documentationUrl: this.sensor.documentationUrl || '',
      location: {
        latitude: this.sensor.location ? this.sensor.location.coordinates[1] : null,
        longitude: this.sensor.location ? this.sensor.location.coordinates[0] : null,
        height: this.sensor.location ? this.sensor.location.coordinates[2] : null,
        baseObjectId: this.sensor.baseObjectId || 'non-empty',
      },
      type: {
        typeName: this.sensor.typeName ? this.sensor.typeName[0] : '',
        typeDetails: this.sensor.typeDetails ? this.sensor.typeDetails.subType : '',
      },
      theme: { value: this.sensor.theme || [] },
    });

    const dataStreams = this.form.get('dataStreams') as FormArray;
    for (const dataStream of this.sensor.dataStreams) {
      dataStreams.push(this.formBuilder.group({
        dataStreamId: dataStream.dataStreamId,
        name: [dataStream.name, Validators.required],
        reason: dataStream.reason || '',
        description: dataStream.description || '',
        observedProperty: dataStream.observedProperty || '',
        isPublic: dataStream.isPublic || true,
        isOpenData: dataStream.isOpenData || true,
        isReusable: dataStream.isReusable || true,
        documentationUrl: [dataStream.documentationUrl || '', [Validators.pattern(this.urlRegex)]],
        dataLink: [dataStream.dataLink || '', [Validators.pattern(this.urlRegex)]],
        unitOfMeasurement: dataStream.unitOfMeasurement || '',
        dataFrequency: dataStream.dataFrequency || 0,
        dataQuality: dataStream.dataQuality || 0,
      }));
    }
  }

  public async submit() {
    this.submitted = true;

    // stop if form is invalid
    if (this.form.valid) {
      const sensor = {
        typeName: this.form.value.type.typeName,
        location: this.form.value.location,
        dataStreams: this.form.value.dataStreams,

        active: this.form.value.active || false,
        aim: this.form.value.aim,
        description: this.form.value.description !== '' ? this.form.value.description : undefined,
        documentationUrl: this.form.value.documentationUrl !== '' ? this.form.value.documentationUrl : undefined,
        manufacturer: this.form.value.manufacturer,
        name: this.form.value.name,
        theme: this.form.value.theme.value,
        typeDetails: {subType: this.form.value.type.typeDetails},
      };

      try {
        const active: boolean = JSON.parse(sensor.active.value); // "true" -> true, case insensitive
        if (active === true && !this.sensor.active) {
          await this.sensorService.activate(this.sensor._id);
        } else if (active === false && this.sensor.active) {
          await this.sensorService.deactivate(this.sensor._id);
        }
      } catch (error) {
        console.error(error);
      }

      try {
        const newDataStreams = sensor.dataStreams || [];
        const newDataStreamIds = newDataStreams.map((d) => d.dataStreamId);
        for (let newDataStream of newDataStreams) {
          if (!newDataStream.hasOwnProperty('dataStreamId')) {
            newDataStream = {
              name: newDataStream.name,
              reason: newDataStream.reason || undefined,
              description: newDataStream.description || undefined,
              observedProperty: newDataStream.observedProperty || undefined,
              isPublic: newDataStream.isPublic,
              isOpenData: newDataStream.isOpenData,
              isReusable: newDataStream.isReusable,
              documentationUrl: newDataStream.documentationUrl || undefined,
              dataLink: newDataStream.dataLink || undefined,
              unitOfMeasurement: newDataStream.unitOfMeasurement || undefined,
              dataFrequency: newDataStream.dataFrequency,
              dataQuality: newDataStream.dataQuality,
            };
            await this.sensorService.addDatastream(this.sensor._id, newDataStream);
          }
        }

        const currentDataStreams = this.sensor.dataStreams || [];
        for (const currentDataStream of currentDataStreams) {
          if (currentDataStream.dataStreamId && !newDataStreamIds.includes(currentDataStream.dataStreamId)) {
            await this.sensorService.deleteDatastream(this.sensor._id, currentDataStream.dataStreamId);
          }
        }

        // Todo update ds if updated.
      } catch (error) {
        console.error(error);
      }

      // TODO: only if some details have changed
      try {
        const details: IUpdateSensorBody = {
          aim: sensor.aim,
          description: sensor.description,
          documentationUrl: sensor.documentationUrl,

          manufacturer: sensor.manufacturer,
          name: sensor.name,
          typeName: sensor.typeName,
          typeDetails: sensor.typeDetails,
          theme: sensor.theme,
        };
        await this.sensorService.updateDetails(this.sensor._id, details);
        console.log(`Sensor was successfully updated.`);
      } catch (error) {
        console.error(error);
      }

      const heightUpdated = this.sensor.location.coordinates[2] !== sensor.location.height;
      const latitudeUpdated = this.sensor.location.coordinates[1] !== sensor.location.latitude;
      const longitudeUpdated = this.sensor.location.coordinates[0] !== sensor.location.longitude;
      if (longitudeUpdated || latitudeUpdated || heightUpdated) {
        try {
          await this.sensorService.updateLocation(this.sensor._id, sensor.location);
        } catch (error) {
          console.error(error);
        }
      }

      this.router.navigate(['']);
    } else {
      this.alertService.error(`The form is invalid.`);
    }
  }

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(6)]],
      aim: '',
      description: '',
      manufacturer: '',
      active: '',
      documentationUrl: ['', [Validators.pattern(this.urlRegex)]],
      dataStreams: new FormArray([]),
      location: [],
      type: [],
      theme: [],
    });

    this.subscriptions.push(
      this.route.params.subscribe(async params => {
        const sensorId = params.id;

        const sensor = await this.sensorService.get(sensorId);
        this.setSensor(sensor as ISensor);
      })
    );

    this.formControlSteps = {
      'Sensor Properties': [
        this.form.controls.name,
        this.form.controls.type,
        this.form.controls.active,
      ], 'Optional Sensor Properties': [
        this.form.controls.aim,
        this.form.controls.description,
        this.form.controls.manufacturer,
        this.form.controls.documentationUrl,
        this.form.controls.theme,
      ], 'Data Streams': [
        this.form.controls.dataStreams,
      ], 'Sensor Location': [
        this.form.controls.location,
      ]};
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
