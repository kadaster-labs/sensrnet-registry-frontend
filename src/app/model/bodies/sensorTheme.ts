export enum SensorTheme {
    Weather = 'Weather',
    NatureAndEnvironment = 'NatureAndEnvironment',
    Waste = 'Waste',
    Safety = 'Safety',
    Mobility = 'Mobility',
    SoilandUnderground = 'SoilandUnderground',
    Other = 'Other',
}

export const SensorThemeTranslation = {
  Weather: $localize`:@@theme.weather:Weather`,
  NatureAndEnvironment: $localize`:@@theme.nature:Nature and Environment`,
  Waste: $localize`:@@theme.waste:Waste`,
  Safety: $localize`:@@theme.safety:Safety`,
  Mobility: $localize`:@@theme.mobility:Mobility`,
  SoilandUnderground: $localize`:@@theme.soil:Soil and Underground`,
  Other: $localize`:@@theme.other:Other`,
};
