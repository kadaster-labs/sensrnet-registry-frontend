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

/*
 * Translations of this 'table' is based on arrays with EN as the key and other
 * translations as the values. Structure of the arrays are:
 * [key in EN (so also value for EN), NL, optional other languages]
 *
 * Besides the translations there's also hierarchy in this table for grouping
 * on a more generic level. This results in a json structure:
 *
 * {
 *    key: '',           // group key
 *    value: ''          // translation value; for EN same as the key
 *    types: [
 *      {
 *         key: '',       // key of specific type
 *         value: ''}     // translation value of specific type; for EN same as the key
 *      }
 *    ]
 * }
 *
 * First row of the array is the generic level key/translation.
 */

const soundSensorTypesArrayWithTranslations = [
  ['Sound sensor', 'Geluidsensor'],
  ['Geophone', 'Geofoon'],
  ['Hydrophone', 'Hydrofoon'],
  ['Microphone', 'Microfoon'],
  ['Seismometer', 'Seismometer'],
  ['SoundLevelMeter', 'Geluidsmeter'],
  ['Sound locator', 'Geluidszoeker'],
];

const chemicalSensorTypesArrayWithTranslations = [
  ['Chemical sensor', 'Chemiesensor'],
  ['Carbon dioxide sensor', 'Kooldioxide-sensor'],
  ['Carbon monoxide detector', 'Koolmonoxidedetector'],
  ['Catalytic bead sensor', 'Katalytische parelsensor'],
  ['Chemical field-effect transistor', 'Chemische veldeffecttransistor'],
  ['Chemiresistor', 'Chemiresistor'],
  ['Electrochemical gas sensor', 'Elektrochemische gassensor'],
  ['Electronic nose', 'Elektronische neus'],
  ['Electrolyte–insulator–semiconductor sensor', 'Elektrolytisolator - halfgeleidersensor'],
  ['Energy-dispersive X-ray spectroscopy', 'Energiedispersieve röntgenspectroscopie'],
  ['Fluorescent chloride sensors', 'Fluorescerende chloride-sensoren'],
  ['Holographic sensor', 'Holografische sensor'],
  ['Hydrocarbon dew point analyzer', 'Koolwaterstof dauwpuntanalysator'],
  ['Hydrogen sensor', 'Waterstofsensor'],
  ['Hydrogen sulfide sensor', 'Waterstofsulfide-sensor'],
  ['Infrared point sensor', 'Infrarood puntsensor'],
  ['Ion-selective electrode', 'Ionselectieve elektrode'],
  ['ISFET', 'ISFET'],
  ['Nondispersive infrared sensor', 'Niet-dispersieve infraroodsensor'],
  ['Microwave chemistry sensor', 'Microgolfchemiesensor'],
  ['Nitrogen oxide sensor', 'Stikstofoxide sensor'],
  ['Nondispersive infrared sensor', 'Niet-dispersieve infraroodsensor'],
  ['Olfactometer', 'Olfactometer'],
  ['Optode', 'Optode'],
  ['Oxygen sensor', 'Zuurstof sensor'],
  ['Ozone monitor', 'Ozon-monitor'],
  ['Pellistor', 'Pellistor'],
  ['pH glass electrode', 'pH-glaselektrode'],
  ['Potentiometric sensor', 'Potentiometrische sensor'],
  ['Redox electrode', 'Redox-elektrode'],
  ['Smoke detector', 'Rookdetector'],
  ['Zinc oxide nanorod sensor', 'Zinkoxide nanostaaf sensor'],
];

const electricCurrentSensorTypesArrayWithTranslations = [
  ['Electric current sensor', 'Electriciteitssensor'],
  ['Current sensor', 'Stroomsensor'],
  ['Daly detector', 'Daly-detector'],
  ['Electroscope', 'Elektroscoop'],
  ['Electron multiplier', 'Elektronenvermenigvuldiger'],
  ['Faraday cup', 'Faraday beker'],
  ['Galvanometer', 'Galvanometer'],
  ['Hall effect sensor', 'Hall-effect sensor'],
  ['Hall probe', 'Hall-sonde'],
  ['Magnetic anomaly detector', 'Magnetische afwijkingsdetector'],
  ['Magnetometer', 'Magnetometer'],
  ['Magnetoresistance', 'Magnetoweerstand'],
  ['MEMS magnetic field sensor', 'MEMS magnetische veldsensor'],
  ['Metal detector', 'Metaaldetector'],
  ['Planar Hall sensor', 'Planar Hall-sensor'],
  ['Radio direction finder', 'Radiorichtingzoeker'],
  ['Voltage detector', 'Spanningsdetector'],

];

const environmentalSensorWeatherStationTypesArrayWithTranslations = [
  ['Environmental sensor / weather station', 'Klimaatsensor'],
  ['Actinometer', 'Actinometer'],
  ['Air pollution sensor', 'Luchtvervuilingssensor'],
  ['Ceilometer', 'Plafondmeter'],
  ['Dew warning', 'Dauw waarschuwing'],
  ['Electrochemical gas sensor', 'Elektrochemische gassensor'],
  ['Fish counter', 'Visteller'],
  ['Frequency domain sensor', 'Frequentiedomeinsensor'],
  ['Gas detector', 'Gas detector'],
  ['Hook gauge evaporimeter', 'Hook gauge verdampingsmeter'],
  ['Humistor', 'Humistor'],
  ['Hygrometer', 'Hygrometer'],
  ['Leaf sensor', 'Blad sensor'],
  ['Lysimeter', 'Lysimeter'],
  ['Pyranometer', 'Pyranometer'],
  ['Pyrgeometer', 'Pyrgeometer'],
  ['Psychrometer', 'Psychrometer'],
  ['Rain gauge', 'Regenmeter'],
  ['Rain sensor', 'Regensensor'],
  ['Seismometer', 'Seismometer'],
  ['SNOTEL', 'SNOTEL'],
  ['Snow gauge', 'Sneeuwmeter'],
  ['Soil moisture sensor', 'Bodemvochtsensor'],
  ['Stream gauge', 'Stroommeter'],
  ['Tide gauge', 'Getijdenmeter'],
  ['Weather radar', 'Weerradar'],
];

const flowSensorTypesArrayWithTranslations = [
  ['Flow sensor', 'Vloeistof- en gaststroomsensor'],
  ['Air flow meter', 'Luchtstroommeter'],
  ['Anemometer', 'Anemometer'],
  ['Flow sensor', 'Stroomsensor'],
  ['Gas meter', 'Gas meter'],
  ['Mass flow sensor', 'Massastroomsensor'],
  ['Water meter', 'Watermeter'],
];

const positionDisplacementSensorTypesArrayWithTranslations = [
  ['Position and displacement sensor', 'Positie- of verplaatsingsensor'],
  ['Accelerometer', 'Versnellingsmeter'],
  ['Auxanometer', 'Auxanometer'],
  ['Capacitive displacement sensor', 'Capacitieve verplaatsingssensor'],
  ['Capacitive sensing', 'Capacitieve detectie'],
  ['DetectionLoop', 'Detectielus'],
  ['Flex sensor', 'Flex-sensor'],
  ['Free fall sensor', 'Vrije val sensor'],
  ['Gravimeter', 'Gravimeter'],
  ['Gyroscopic sensor', 'Gyroscopische sensor'],
  ['HeightDetectionDevice', 'Hoogte sensor'],
  ['Impact sensor', 'Impact sensor'],
  ['Inclinometer', 'Hellingsmeter'],
  ['Incremental encoder', 'Incrementele encoder'],
  ['Integrated circuit piezoelectric sensor', 'Piëzo-elektrische sensor met geïntegreerde schakeling'],
  ['Laser rangefinder', 'Laser afstandsmeter'],
  ['Laser surface velocimeter', 'Laser oppervlaktesnelheidsmeter'],
  ['LIDAR', 'LIDAR'],
  ['Linear encoder', 'Lineaire encoder'],
  ['Linear variable differential transformer (LVDT)', 'Lineaire variabele differentiële transformator (LVDT)'],
  ['Liquid capacitive inclinometers', 'Vloeibare capacitieve inclinometers'],
  ['Odometer', 'Kilometerteller'],
  ['Photoelectric sensor', 'Foto-elektrische sensor'],
  ['Piezoelectric accelerometer', 'Piëzo-elektrische versnellingsmeter'],
  ['Position sensor', 'Positiesensor'],
  ['Position sensitive device', 'Positiegevoelig apparaat'],
  ['Angular rate sensor', 'Hoeksensor'],
  ['Rotary encoder', 'Draaiknop'],
  ['Rotary variable differential transformer', 'Roterende variabele differentiële transformator'],
  ['Selsyn', 'Selsyn'],
  ['Shock detector', 'Schokdetector'],
  ['Shock data logger', 'Datalogger voor schokken'],
  ['SpeedDetectionDevice', 'SpeedDetectionDevice'],
  ['Sudden Motion Sensor', 'Plotselinge bewegingssensor'],
  ['Tilt sensor', 'Kantel sensor'],
  ['Tachometer', 'Toerenteller'],
  ['Ultrasonic thickness gauge', 'Ultrasone diktemeter'],
  ['Ultra-wideband radar', 'Ultrabreedbandradar'],
  ['Variable reluctance sensor', 'Variabele reluctantiesensor'],
  ['Velocity receiver', 'Snelheidsontvanger'],
];

const opticalCameraSensorTypesArrayWithTranslations = [
  ['Optical / camerasensor', 'Optische sensor'],
  ['CMOS sensor', 'CMOS-sensor'],
  ['Colorimeter', 'Colorimeter'],
  ['Contact image sensor', 'Contact beeldsensor'],
  ['Electro-optical sensor', 'Elektro-optische sensor'],
  ['Flame detector', 'Vlam detector'],
  ['Infra-red sensor', 'Infrarood sensor'],
  ['Kinetic inductance detector', 'Kinetische inductantiedetector'],
  ['LED as light sensor', 'LED als lichtsensor'],
  ['Light-addressable potentiometric sensor', 'Lichtadresseerbare potentiometrische sensor'],
  ['Nichols radiometer', 'Nichols radiometer'],
  ['Fiber optic sensors', 'Vezeloptische sensoren'],
  ['Optical position sensor', 'Optische positiesensor'],
  ['Thermopile laser sensors', 'Thermozuil lasersensoren'],
  ['Photodetector', 'Fotodetector'],
  ['Photodiode', 'Fotodiode'],
  ['Photomultiplier', 'Fotomultiplicator'],
  ['Photomultiplier tube', 'Fotomultiplicatorbuis'],
  ['Phototransistor', 'Fototransistor'],
  ['Photoelectric sensor', 'Foto-elektrische sensor'],
  ['Photoionization detector', 'Foto-ionisatiedetector'],
  ['Photomultiplier', 'Fotomultiplicator'],
  ['Photoresistor', 'Fotoweerstand'],
  ['Photoswitch', 'Photoswitch'],
  ['Phototube', 'Fototube'],
  ['Scintillometer', 'Scintillometer'],
  ['Shack–Hartmann wavefront sensor', 'Shack-Hartmann-golffrontsensor'],
  ['Single-photon avalanche diode', 'Lawinediode met één foton'],
  ['Superconducting nanowire single-photon detector', 'Supergeleidende nanodraad enkelfotondetector'],
  ['Transition-edge sensor', 'Overgangsrand sensor'],
  ['UVSensor', 'UV-sensor'],
  ['Visible Light Photon Counter', 'Zichtbaar licht foton-teller'],
  ['Wavefront sensor', 'Wavefront-sensor'],
];

const pressureSensorTypesArrayWithTranslations = [
  ['Pressure sensor', 'Druksensor'],
  ['Barograph', 'Barograaf'],
  ['Barometer', 'Barometer'],
  ['Bourdon gauge', 'Bourdonmeter'],
  ['Hot filament ionization gauge', 'Heet filament ionisatie meter'],
  ['Ionization gauge', 'Ionisatiemeter'],
  ['McLeod gauge', 'McLeod-meter'],
  ['Oscillating U-tube', 'Oscillerende U-buis'],
  ['Piezometer', 'Piëzometer'],
  ['Pirani gauge', 'Pirani-meter'],
  ['Pressure sensor', 'Druksensor'],
  ['Pressure gauge', 'Drukmeter'],
  ['Tactile sensor', 'Tastsensor'],
  ['Time pressure gauge', 'Tijd manometer'],
];

const densitySensorTypesArrayWithTranslations = [
  ['Density sensor', 'Dichtheidsensor'],
  ['Bhangmeter', 'Bhangmeter'],
  ['Hydrometer', 'Hydrometer'],
  ['Force gauge / sensor', 'Krachtmeter/-sensor'],
  ['Level sensor', 'Niveausensor'],
  ['Magnetic level gauge', 'Magnetische niveaumeter'],
  ['Piezocapacitive pressure sensor', 'Piëzocapacitieve druksensor'],
  ['Piezoelectric sensor', 'Piëzo-elektrische sensor'],
  ['Strain gauge', 'Spanningsmeter'],
  ['Torque sensor', 'Koppel sensor'],
  ['Viscometer', 'Viscometer'],
];

const temperatureSensorTypesArrayWithTranslations = [
  ['Temperature sensor', 'Temperatuursensor'],
  ['Bolometer', 'Bolometer'],
  ['Flame detection', 'Vlamdetectie'],
  ['Gardon gauge', 'Gardon-meter'],
  ['Golay cell', 'Golay-cel'],
  ['Heat flux sensor', 'Warmtefluxsensor'],
  ['Infrared thermometer', 'Infrarood thermometer'],
  ['Microwave radiometer', 'Microgolfmeter'],
  ['Net radiometer', 'Netto radiometer'],
  ['Quartz thermometer', 'Kwarts thermometer'],
  ['Resistance thermometer', 'Weerstandsthermometer'],
  ['Silicon bandgap temperature sensor', 'Silicium bandgap temperatuursensor'],
  ['Special sensor microwave/imager', 'Speciale sensor microgolf / imager'],
  ['Temperature gauge', 'Temperatuurmeter'],
  ['Thermistor', 'Thermistor'],
  ['Thermocouple', 'Thermokoppel'],
  ['Thermometer', 'Thermometer'],
  ['Pyrometer', 'Pyrometer'],
];

const proximitySensorTypesArrayWithTranslations = [
  ['Proximity sensor', 'Aanwezigheid of nabijheidsensor'],
  ['Alarm sensor', 'Alarmsensor'],
  ['Doppler radar', 'Doppler-radar'],
  ['Motion detector', 'Bewegingsdetector'],
  ['Occupancy sensor', 'Aanwezigheidssensor'],
  ['Proximity sensor', 'Nabijheidssensor'],
  ['Passive infrared sensor', 'Passieve infraroodsensor'],
  ['Reed switch', 'Reed-schakelaar'],
  ['Stud finder', 'Stud finder'],
  ['Triangulation sensor', 'Triangulatie sensor'],
  ['Touch switch', 'Touch schakelaar'],
  ['BioFET', 'BioFET'],
  ['Biochip', 'Biochip'],
  ['Biosensor', 'Biosensor'],
  ['Capacitance probe', 'Capaciteit sonde'],
  ['Capacitance sensor', 'Capaciteitssensor'],
  ['Catadioptric sensor', 'Catadioptrische sensor'],
  ['Carbon paste electrode', 'Koolstofpasta-elektrode'],
  ['Digital sensors', 'Digitale sensoren'],
  ['Displacement receiver', 'Verplaatsingsontvanger'],
  ['Electromechanical film', 'Elektromechanische film'],
  ['Electro-optical sensor', 'Elektro-optische sensor'],
  ['Electrochemical fatigue crack sensor', 'Elektrochemische vermoeidheidsscheursensor'],
  ['Fabry–Pérot interferometer', 'Fabry-Pérot-interferometer'],
  ['Fisheries acoustics', 'Akoestiek in de visserij'],
  ['Image sensor', 'Beeldsensor'],
  ['Image sensor format', 'Formaat beeldsensor'],
  ['Inductive sensor', 'Inductie sensor'],
  ['Intelligent sensor', 'Intelligente sensor'],
  ['Lab-on-a-chip', 'Lab-op-een-chip'],
  ['Leaf sensor', 'Blad sensor'],
  ['Machine vision', 'Machine visie'],
  ['Microelectromechanical systems', 'Micro-elektromechanische systemen'],
  ['MOSFET', 'MOSFET'],
  ['Photoelasticity', 'Foto-elasticiteit'],
  ['Quantum sensor', 'Quantumsensor'],
  ['Radar', 'Radar'],
  ['Ground-penetrating radar', 'Gronddoordringende radar'],
  ['Synthetic aperture radar', 'Synthetische diafragma-radar'],
  ['Radar tracker', 'Radartracker'],
  ['Stretch sensor', 'Uitrekbare sensor'],
  ['Sensor array', 'Sensorreeks'],
  ['Sensor fusion', 'Sensor fusie'],
  ['Sensor grid', 'Sensor rooster'],
  ['Sensor node', 'Sensorknooppunt'],
  ['Soft sensor', 'Zachte sensor'],
  ['Sonar', 'Sonar'],
  ['Staring array', 'Starende array'],
  ['Transducer', 'Omvormer'],
  ['Ultrasonic sensor', 'Ultrasoon sensor'],
  ['Video sensor', 'Videosensor'],
  ['Visual sensor network', 'Visueel sensornetwerk'],
  ['Wheatstone bridge', 'Wheatstone-brug'],
  ['Wireless sensor network', 'Draadloos sensornetwerk'],
];

const otherTypesArrayWithTranslations = [
  ['Other', 'Overig'],
  ['Actigraphy', 'Actigrafie'],
  ['Air pollution sensor', 'Luchtvervuilingssensor'],
  ['Analog image processing', 'Analoge beeldverwerking'],
  ['Atomic force microscopy', 'Atoomkrachtmicroscopie'],
  ['Atomic Gravitational Wave Interferometric Sensor', 'Atoomzwaartekrachtgolf interferometrische sensor'],
  ['Catadioptric sensor', 'Catadioptrische sensor'],
  ['Chemoreceptor', 'Chemoreceptor'],
  ['Compressive sensing', 'Compressieve detectie'],
  ['Cryogenic particle detectors', 'Cryogene deeltjesdetectoren'],
  ['Dew warning', 'Dauw waarschuwing'],
  ['Diffusion tensor imaging', 'Diffusie tensor beeldvorming'],
  ['Digital holography', 'Digitale holografie'],
  ['Electronic tongue', 'Elektronische tong'],
  ['Fine Guidance Sensor', 'Fijne geleidingssensor'],
  ['FineDustSensor', 'Fijnstofsensor'],
  ['Flat panel detector', 'Flat panel detector'],
  ['Functional magnetic resonance imaging', 'Functionele magnetische resonantiebeeldvorming'],
  ['Glass break detector', 'Glasbreukmelder'],
  ['Heartbeat sensor', 'Hartslagsensor'],
  ['Hyperspectral sensors', 'Hyperspectrale sensoren'],
  ['IRIS (Biosensor), Interferometric Reflectance Imaging Sensor', 'IRIS (Biosensor), interferometrische reflectie-beeldsensor'],
  ['Laser beam profiler', 'Laserstraal profiler'],
  ['Littoral Airborne Sensor/Hyperspectral', 'Littoral Airborne Sensor / Hyperspectraal'],
  ['LORROS', 'LORROS'],
  ['Millimeter wave scanner', 'Millimetergolfscanner'],
  ['Magnetic resonance imaging', 'Magnetische resonantie beeldvorming'],
  ['Moire deflectometry', 'Moiré-deflectometrie'],
  ['Molecular sensor', 'Moleculaire sensor'],
  ['Nanosensor', 'Nanosensor'],
  ['Nano-tetherball Sensor', 'Nano-tetherball-sensor'],
  ['Omnidirectional camera', 'Omnidirectionele camera'],
  ['Organoleptic sensors', 'Organoleptische sensoren'],
  ['Optical coherence tomography', 'Optische coherentietomografie'],
  ['Phase unwrapping techniques', 'Fase-uitpaktechnieken'],
  ['Polygraph Truth Detection', 'Polygraaf waarheidsdetectie'],
  ['Positron emission tomography', 'Positron-emissietomografie'],
  ['Push broom scanner', 'Duw de bezemscanner'],
  ['Quantization (signal processing)', 'Kwantisering (signaalverwerking)'],
  ['Range imaging', 'Bereik beeldvorming'],
  ['Single-Photon Emission Computed Tomography (SPECT)', 'Single-Photon Emission Computed Tomography (SPECT)'],
  ['Smartdust', 'Slimme stof'],
  ['SQUID, Superconducting quantum interference device', 'SQUID, supergeleidend kwantuminterferentie-apparaat'],
  ['SSIES, Special Sensors-Ions, Electrons, and Scintillation thermal plasma analysis package', 'SSIES, speciale sensoren-ionen, elektronen en scintillatie thermisch plasma-analysepakket'],
  ['SSMIS, Special Sensor Microwave Imager / Sounder', 'SSMIS, speciale sensor-microgolf-imager / -sounder'],
  ['Structured-light 3D scanner', 'Gestructureerd licht 3D-scanner'],
  ['Sun sensor, Attitude control (spacecraft)', 'Zonnesensor, Attitude control (ruimtevaartuig)'],
  ['Superconducting nanowire single-photon detector', 'Supergeleidende nanodraad enkelfotondetector'],
  ['Thin-film thickness monitor', 'Monitor voor dunne filmdikte'],
  ['Time-of-flight camera', 'Time-of-flight camera'],
  ['TriDAR, Triangulation and LIDAR Automated Rendezvous and Docking', 'TriDAR, Triangulatie en LIDAR Geautomatiseerde Rendez-vous en Docking'],
  ['Unattended Ground Sensors', 'Onbeheerde grondsensoren'],
];

let sensorTypesEN = null;
let sensorTypesNL = null;

export function getSensorTypesTranslation(locale: string = 'en') {
  const currentLocale = locale != null ? locale : 'en';

  switch (currentLocale) {
    case 'nl':
      buildNL();
      return sensorTypesNL;
    case 'en':
    default:
      buildEN();
      return sensorTypesEN;
  }
}

function buildEN() {
  if (sensorTypesEN == null) {
    sensorTypesEN = buildSensorTypesObject(0);
  }
  return sensorTypesEN;
}

function buildNL() {
  if (sensorTypesNL == null) {
    sensorTypesNL = buildSensorTypesObject(1);
  }
  return sensorTypesNL;
}

function buildSensorTypesObject(translationColumn: number): Record<string, any>[] {
  return [
    fromArrayToSensorTypesObject(soundSensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(chemicalSensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(electricCurrentSensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(environmentalSensorWeatherStationTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(flowSensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(positionDisplacementSensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(opticalCameraSensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(pressureSensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(densitySensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(temperatureSensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(proximitySensorTypesArrayWithTranslations, translationColumn),
    fromArrayToSensorTypesObject(otherTypesArrayWithTranslations, translationColumn),
  ];
}

function fromArrayToSensorTypesObject(ar: string[][], languageColumn: number = 0): Record<string, any> {
  const obj = {
    key: ar[0][0],
    value: ar[0][languageColumn],
    types: []
  };

  for (let index = 1; index < ar.length; index++) {
    const element = ar[index];
    obj.types.push({key: element[0], value: element[languageColumn]});
  }
  return obj;
}
