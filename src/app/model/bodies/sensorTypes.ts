export enum Category {
    Beacon = 'Beacon',
    Sensor = 'Sensor',
    Camera = 'Camera',
}

const CategoryTranslation = {
  Beacon: $localize`:@@type.beacon:Beacon`,
  Sensor: $localize`:@@type.sensor:Sensor`,
  Camera: $localize`:@@type.camera:Camera`,
};

export function getCategoryTranslation(category) {
    return CategoryTranslation[category] ? CategoryTranslation[category] : category;
}

export enum TypeSensor {
    WeatherStation = 'WeatherStation',
    WindGauge = 'WindGauge',
    WasteContainers = 'WasteContainers',
    FineDustSensor = 'FineDustSensor',
    UVSensor = 'UVSensor',
    LightCell = 'LightCell',
    MotionSensor = 'MotionSensor',
    FireDetector = 'FireDetector',
    WaterLevelMeter = 'WaterLevelMeter',
    MicrophoneOrSoundMeter = 'MicrophoneOrSoundMeter',
    PedometerCounters = 'PedometerCounters',
    RadarDetector = 'RadarDetector',
    GMSSensor = 'GMSSensor',
    DetectionLoop = 'DetectionLoop',
    HeightDetectionDevice = 'HeightDetectionDevice',
}

const TypeSensorTranslation = {
  WeatherStation: $localize`:@@type.weather:Weather Station`,
  WindGauge: $localize`:@@type.gauge:Wind Gauge`,
  WasteContainers: $localize`:@@type.container:Waste Container`,
  FineDustSensor: $localize`:@@type.dust:Fine Dust Sensor`,
  UVSensor: $localize`:@@type.uv:UV-Sensor`,
  LightCell: $localize`:@@type.light:Light Cell`,
  MotionSensor: $localize`:@@type.motion:Motion Sensor`,
  FireDetector: $localize`:@@type.fire:Fire Detector`,
  WaterLevelMeter: $localize`:@@type.water:Waterlevel Meter`,
  MicrophoneOrSoundMeter: $localize`:@@type.mic:Microphone / Sound Meter`,
  PedometerCounters: $localize`:@@type.counter:Pedometer Counter`,
  RadarDetector: $localize`:@@type.radar:Radar Detector`,
  GMSSensor: $localize`:@@type.gsm:GSM Sensor`,
  DetectionLoop: $localize`:@@type.detection:Detection Loop`,
  HeightDetectionDevice: $localize`:@@type.height:Height Detection Device`,
};

export enum TypeCamera {
    EnvironmentalZone = 'EnvironmentalZone',
    SecurityCamera = 'SecurityCamera',
    TrafficFlashlight = 'TrafficFlashlight',
}

const TypeCameraTranslation = {
  EnvironmentalZone: $localize`:@@type.environment:Environmental Zone`,
  SecurityCamera: $localize`:@@type.security:Security Camera`,
  TrafficFlashlight: $localize`:@@type.flashlight:Traffic Flashlight`,
};

export enum TypeBeacon {
    NavigationBeacon = 'NavigationBeacon',
}

const TypeBeaconTranslation = {
  NavigationBeacon: $localize`:@@type.navigation:Navigation Beacon`,
};

const typeTranslation = {...TypeSensorTranslation, ...TypeCameraTranslation, ...TypeBeaconTranslation};

export function getTypeTranslation(type) {
    return typeTranslation[type] ? typeTranslation[type] : type;
}
