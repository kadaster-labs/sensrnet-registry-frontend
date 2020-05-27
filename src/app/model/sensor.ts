export class Sensor {
    constructor(
        public name: string,
        public aim: string,
        public description: string,
        public manufacturer: string,
        public active: boolean,
        public observationArea: string,
        public documentation: URL,
        public dataStream: DataStream[],
        public location: Location,
        public theme: Theme,
        public category: Category,
        public type: TypeBeacon | TypeCamera | TypeSensor,
        public typeDetails: JSON
    ) { }
}

export class DataStream {
    constructor(
        public name: string,
        public reason: string,
        public description: string,
        public observedProperty: string,
        public unitOfMeasurment: string,
        public isPublic: boolean,
        public isOpenData: boolean,
        public isReusable: boolean,
        public documentation: URL,
        public datalink: URL,
        public dataFrequency: number,
        public dataQuality: number
    ) { }
}

export class Location {
    constructor(
        public x: number,
        public y: number,
        public z: number,
        public epsgCode: number,
        public basObjectId: string
    ) {}
}

export enum Theme {
    Wheather,
    NatureAndEnvironment,
    Waste,
    Safety,
    Mobility,
    SoilAndUnderground,
    Other
}

export enum Category{
    Sensor,
    Camera,
    Beacon,
}

export enum TypeBeacon {
    NavigationBeacon
}

export enum TypeCamera {
    EnvironmentalZoneCameras,
    SecurityCamera,
    TraphicFlashlight
}

export enum TypeSensor {
    WheatherStation,
    WindGauge,
    WasteContainer,
    FineDustSensor,
    UVSensor,
    LightCell,
    MotionSensor,
    FireDetector,
    WaterLevelMeter,
    MicrophoneOrSoundMeter,
    PedometerCounters,
    RadarDetector,
    GMSSensor,
    DetectionLoop,
    HeightDetectionDevice
}

