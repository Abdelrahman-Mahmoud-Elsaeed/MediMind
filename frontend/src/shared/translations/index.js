import { authTranslations } from './auth.translations';
import { commonTranslations } from './common.translations';
import { dashboardTranslations } from './dashboard.translations';
import { medicationsTranslations } from './medications.translations';
import { caregiverTranslations } from './caregiver.translations';
import { patientTranslations } from './patient.translations';
import { landingTranslations } from './landing.translations';
import { errorsTranslations } from './errors.translations';
import { pharmacyTranslations } from './pharmacy.translations';

function deepMerge(target = {}, source = {}) {
  if (!source) return target;
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const modulesEn = [
  authTranslations.en,
  commonTranslations.en,
  dashboardTranslations.en,
  medicationsTranslations.en,
  caregiverTranslations.en,
  patientTranslations.en,
  landingTranslations.en,
  errorsTranslations.en,
  pharmacyTranslations.en,
];

const modulesAr = [
  authTranslations.ar,
  commonTranslations.ar,
  dashboardTranslations.ar,
  medicationsTranslations.ar,
  caregiverTranslations.ar,
  patientTranslations.ar,
  landingTranslations.ar,
  errorsTranslations.ar,
  pharmacyTranslations.ar,
];

export const translations = {
  en: modulesEn.reduce((acc, curr) => deepMerge(acc, curr), {}),
  ar: modulesAr.reduce((acc, curr) => deepMerge(acc, curr), {}),
};

export default translations;
