const weightUnitOfMeasurements = [
    {
        name: $localize`:@@uof.gram.name:Gram`,
        symbol: $localize`:@@uof.gram.symbol:g`,
    },
    {
        name: $localize`:@@uof.kilogram.name:Kilogram`,
        symbol: $localize`:@@uof.kilogram.symbol:kg`,
    },
    {
        name: $localize`:@@uof.ton.name:Tonne`,
        symbol: $localize`:@@uof.ton.symbol:t`,
    },
    {
        name: $localize`:@@uof.ounce.name:Ounce`,
        symbol: $localize`:@@uof.ounce.symbol:oz`,
    },
    {
        name: $localize`:@@uof.pound.name:Pound`,
        symbol: $localize`:@@uof.pound.symbol:lb`,
    },
];

const distanceUnitOfMeasurements = [
    {
        name: $localize`:@@uof.millimeter.name:Millimeter`,
        symbol: $localize`:@@uof.millimeter.symbol:mm`,
    },
    {
        name: $localize`:@@uof.centimeter.name:Centimeter`,
        symbol: $localize`:@@uof.centimeter.symbol:cm`,
    },
    {
        name: $localize`:@@uof.meter.name:Meter`,
        symbol: $localize`:@@uof.meter.symbol:m`,
    },
    {
        name: $localize`:@@uof.kilometer.name:Kilometer`,
        symbol: $localize`:@@uof.kilometer.symbol:km`,
    },
    {
        name: $localize`:@@uof.inch.name:Inch`,
        symbol: $localize`:@@uof.inch.symbol:in`,
    },
    {
        name: $localize`:@@uof.feet.name:Feet`,
        symbol: $localize`:@@uof.ft.symbol:ft`,
    },
    {
        name: $localize`:@@uof.mile.name:Mile`,
        symbol: $localize`:@@uof.mile.symbol:mi`,
    },
];

const surfaceUnitOfMeasurements = [
    {
        name: $localize`:@@uof.mm2.name:Square millimeter`,
        symbol: $localize`:@@uof.mm2.symbol:mm2`,
    },
    {
        name: $localize`:@@uof.cm2.name:Square centimeter`,
        symbol: $localize`:@@uof.cm2.symbol:cm2`,
    },
    {
        name: $localize`:@@uof.m2.name:Square meter`,
        symbol: $localize`:@@uof.m2.symbol:m2`,
    },
    {
        name: $localize`:@@uof.km2.name:Square kilometer`,
        symbol: $localize`:@@uof.km2.symbol:km2`,
    },
    {
        name: $localize`:@@uof.hectare.name:Hectare`,
        symbol: $localize`:@@uof.hectare.symbol:ha`,
    },
    {
        name: $localize`:@@uof.sqft.name:Square feet`,
        symbol: $localize`:@@uof.sqft.symbol:sqft`,
    },
    {
        name: $localize`:@@uof.acre.name:Acre`,
        symbol: $localize`:@@uof.acre.symbol:acre`,
    },
];

const durationUnitOfMeasurements = [
    {
        name: $localize`:@@uof.seconds.name:Seconds`,
        symbol: $localize`:@@uof.seconds.symbol:s`,
    },
    {
        name: $localize`:@@uof.minutes.name:Minutes`,
        symbol: $localize`:@@uof.minutes.symbol:m`,
    },
    {
        name: $localize`:@@uof.hours.name:Hours`,
        symbol: $localize`:@@uof.hours.symbol:h`,
    },
    {
        name: $localize`:@@uof.days.name:Days`,
        symbol: $localize`:@@uof.days.symbol:d`,
    },
    {
        name: $localize`:@@uof.months.name:Months`,
        symbol: $localize`:@@uof.months.symbol:m`,
    },
    {
        name: $localize`:@@uof.years.name:Years`,
        symbol: $localize`:@@uof.years.symbol:y`,
    },
];

const energyUnitOfMeasurements = [
    {
        name: $localize`:@@uof.wh.name:Watt hour`,
        symbol: $localize`:@@uof.wh.symbol:Wh`,
    },
    {
        name: $localize`:@@uof.kwh.name:Kilowatt hour`,
        symbol: $localize`:@@uof.kwh.symbol:kWh`,
    },
    {
        name: $localize`:@@uof.mwh.name:Megawatt hour`,
        symbol: $localize`:@@uof.mwh.symbol:MWh`,
    },
    {
        name: $localize`:@@uof.gwh.name:Gigawatt hour`,
        symbol: $localize`:@@uof.gwh.symbol:GWh`,
    },
    {
        name: $localize`:@@uof.twh.name:Terawatt hour`,
        symbol: $localize`:@@uof.twh.symbol:TWh`,
    },
    {
        name: $localize`:@@uof.toe.name:Tonnes of oil-equivalent`,
        symbol: $localize`:@@uof.toe.symbol:toe`,
    },
    {
        name: $localize`:@@uof.ktCo2.name:CO2-equivalent in kilotonnes`,
        symbol: $localize`:@@uof.ktCo2.symbol:ktCo2`,
    },
];

const pressureUnitOfMeasurements = [
    {
        name: $localize`:@@uof.bar.name:Bar`,
        symbol: $localize`:@@uof.bar.symbol:bar`,
    },
    {
        name: $localize`:@@uof.mbar.name:Millibar`,
        symbol: $localize`:@@uof.mbar.symbol:mbar`,
    },
    {
        name: $localize`:@@uof.pascal.name:Pascal`,
        symbol: $localize`:@@uof.pascal.symbol:Pa`,
    },
];

const intensityUnitOfMeasurementEntries = [
    [$localize`:@@uof.db.name:Decibel`, $localize`:@@uof.db.symbol:db`], // Default decibel
    [$localize`:@@uof.dba.name:Decibel`, $localize`:@@uof.dba.symbol:db(A)`], // Decibel filter b
    [$localize`:@@uof.dbb.name:Decibel`, $localize`:@@uof.dbb.symbol:db(B)`], // Decibel filter c
    [$localize`:@@uof.watt.name:Watt`, $localize`:@@uof.watt.symbol:W`],
    [$localize`:@@uof.kw.name:Kilowatt`, $localize`:@@uof.kw.symbol:kW`],
    [$localize`:@@uof.mw.name:Megawatt`, $localize`:@@uof.mw.symbol:MW`],
    [$localize`:@@uof.gw.name:Gigawatt`, $localize`:@@uof.gw.symbol:GW`],
    [$localize`:@@uof.kva.name:Kilovolt-Ampère`, $localize`:@@uof.kva.symbol:kVA`],
    [$localize`:@@uof.ka.name:Ampère`, $localize`:@@uof.ka.symbol:kA`],
    [$localize`:@@uof.volt.name:Volt`, $localize`:@@uof.volt.symbol:V`],
    [$localize`:@@uof.kv.name:Kilovolt`, $localize`:@@uof.kv.symbol:kV`],
];

const intensityUnitOfMeasurements = intensityUnitOfMeasurementEntries.map((intensityUnitOfMeasurementEntry) => ({
    name: intensityUnitOfMeasurementEntry[0],
    symbol: intensityUnitOfMeasurementEntry[1],
}));

const speedUnitOfMeasurements = [
    {
        name: $localize`:@@uof.mps.name:Meters per second`,
        symbol: $localize`:@@uof.mps.symbol:m/s`,
    },
    {
        name: $localize`:@@uof.kmps.name:Kilometers per second`,
        symbol: $localize`:@@uof.kmps.symbol:km/s`,
    },
    {
        name: $localize`:@@uof.kmph.name:Kilometers per hour`,
        symbol: $localize`:@@uof.kmph.symbol:km/h`,
    },
    {
        name: $localize`:@@uof.mph.name:Mile per hour`,
        symbol: $localize`:@@uof.mph.symbol:mph`,
    },
];

const temperatureUnitOfMeasurements = [
    {
        name: $localize`:@@uof.celcius.name:Celsius`,
        symbol: $localize`:@@uof.celcius.symbol:C`,
    },
    {
        name: $localize`:@@uof.fahrenheit.name:Fahrenheit`,
        symbol: $localize`:@@uof.fahrenheit.symbol:F`,
    },
    {
        name: $localize`:@@uof.kelvin.name:Kelvin`,
        symbol: $localize`:@@uof.kelvin.symbol:K`,
    },
];

const volumeUnitOfMeasurements = [
    {
        name: $localize`:@@uof.cm3.name:Cubic centimeter`,
        symbol: $localize`:@@uof.cm3.symbol:cm3`,
    },
    {
        name: $localize`:@@uof.dm3.name:Cubic decimeter`,
        symbol: $localize`:@@uof.dm3.symbol:dm3`,
    },
    {
        name: $localize`:@@uof.m3.name:Cubic meter`,
        symbol: $localize`:@@uof.m3.symbol:m3`,
    },
    {
        name: $localize`:@@uof.liter.name:Liter`,
        symbol: $localize`:@@uof.liter.symbol:L`,
    },
    {
        name: $localize`:@@uof.hectoliter.name:Hectoliter`,
        symbol: $localize`:@@uof.hectoliter.symbol:hL`,
    },
    {
        name: $localize`:@@uof.hm3.name:Cubic hectometer`,
        symbol: $localize`:@@uof.hm3.symbol:hm3`,
    },
];

const volumePercentageUnitOfMeasurements = [
    {
        name: $localize`:@@uof.m3s.name:Cubic meter per second`,
        symbol: $localize`:@@uof.m3s.symbol:m3/s`,
    },
    {
        name: $localize`:@@uof.Ls.name:Liter per second`,
        symbol: $localize`:@@uof.Ls.symbol:L/s`,
    },
    {
        name: $localize`:@@uof.m3h.name:Cubic meter per hour`,
        symbol: $localize`:@@uof.m3h.symbol:m3/h`,
    },
    {
        name: $localize`:@@uof.Lh.name:Liter per hour`,
        symbol: $localize`:@@uof.Lh.symbol:L/h`,
    },
    {
        name: $localize`:@@uof.m3d.name:Cubic meter per day`,
        symbol: $localize`:@@uof.m3d.symbol:m3/d`,
    },
    {
        name: $localize`:@@uof.Ld.name:Liter per day`,
        symbol: $localize`:@@uof.Ld.symbol:L/d`,
    },
];

const concentrationUnitOfMeasurements = [
    {
        name: $localize`:@@uof.ppm.name:Part per million`,
        symbol: $localize`:@@uof.ppm.symbol:ppm`,
    },
];

const densityUnitOfMeasurements = [
    {
        name: $localize`:@@uof.µgL.name:Microgram per liter`,
        symbol: $localize`:@@uof.µgL.symbol:µg/L`,
    },
    {
        name: $localize`:@@uof.mgL.name:Miligram per liter`,
        symbol: $localize`:@@uof.mgL.symbol:mg/L`,
    },
    {
        name: $localize`:@@uof.µgm3.name:Microgram per cubic meter`,
        symbol: $localize`:@@uof.µgm3.symbol:µ5g/m3`,
    },
    {
        name: $localize`:@@uof.mgm3.name:Milligram per cubic meter`,
        symbol: $localize`:@@uof.mgm3.symbol:mg/m3`,
    },
    {
        name: $localize`:@@uof.gL.name:Gram per liter`,
        symbol: $localize`:@@uof.gL.symbol:g/L`,
    },
    {
        name: $localize`:@@uof.kgm3.name:Kilogram per cubic meter`,
        symbol: $localize`:@@uof.kgm3.symbol:kg/m3`,
    },
];

const digitalUnitOfMeasurement = [
    {
        name: $localize`:@@uof.byte.name:Byte`,
        symbol: $localize`:@@uof.byte.symbol:B`,
    },
    {
        name: $localize`:@@uof.kilobyte.name:Kilobyte`,
        symbol: $localize`:@@uof.kilobyte.symbol:kB`,
    },
    {
        name: $localize`:@@uof.megabyte.name:Megabyte`,
        symbol: $localize`:@@uof.megabyte.symbol:MB`,
    },
    {
        name: $localize`:@@uof.gigabyte.name:Gigabyte`,
        symbol: $localize`:@@uof.gigabyte.symbol:GB`,
    },
    {
        name: $localize`:@@uof.terabyte.name:Terabyte`,
        symbol: $localize`:@@uof.terabyte.symbol:TB`,
    },
    {
        name: $localize`:@@uof.petabyte.name:Petabyte`,
        symbol: $localize`:@@uof.petabyte.symbol:PB`,
    },
];

const frequencyUnitOfMeasurement = [
    {
        name: $localize`:@@uof.hertz.name:Hertz`,
        symbol: $localize`:@@uof.hertz.symbol:Hz`,
    },
    {
        name: $localize`:@@uof.megahertz.name:Megahertz`,
        symbol: $localize`:@@uof.megahertz.symbol:MHz`,
    },
    {
        name: $localize`:@@uof.gigahertz.name:Gigahertz`,
        symbol: $localize`:@@uof.gigahertz.symbol:GHz`,
    },
];

const percentageUnitOfMeasurements = [
    {
        name: $localize`:@@uof.percentage.name:Percentage`,
        symbol: $localize`:@@uof.percentage.symbol:%`,
    },
];

export const unitOfMeasurementTypes = [
    ...weightUnitOfMeasurements,
    ...distanceUnitOfMeasurements,
    ...surfaceUnitOfMeasurements,
    ...durationUnitOfMeasurements,
    ...energyUnitOfMeasurements,
    ...pressureUnitOfMeasurements,
    ...intensityUnitOfMeasurements,
    ...speedUnitOfMeasurements,
    ...temperatureUnitOfMeasurements,
    ...volumeUnitOfMeasurements,
    ...volumePercentageUnitOfMeasurements,
    ...concentrationUnitOfMeasurements,
    ...densityUnitOfMeasurements,
    ...digitalUnitOfMeasurement,
    ...frequencyUnitOfMeasurement,
    ...percentageUnitOfMeasurements,
];
