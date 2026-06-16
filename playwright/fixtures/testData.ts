// playwright/fixtures/testData.ts
// Centralised test data — one place to update credentials, patient data, URLs
// Replaces hardcoded strings scattered across Cypress test files

export const credentials = {
  admin: {
    username: 'admin',
    password: 'Admin123',
  },
}

export const location = 'Inpatient Ward'

export const testPatient = {
  givenName: 'Playwright',
  familyName: 'TestUser',
  gender: 'Male',
  birthdateDay: '15',
  birthdateMonth: 'January',
  birthdateYear: '1990',
  address: '123 Automation Lane',
  city: 'London',
  country: 'United Kingdom',
  phone: '07123456789',
}

export const urls = {
  login: '/openmrs/login.htm',
  home: '/openmrs/referenceapplication/home.page',
  registerPatient: '/openmrs/registrationapp/registerPatient.page?appId=referenceapplication.registrationapp.registerPatient',
  findPatient: '/openmrs/coreapps/findpatient/findPatient.page?app=coreapps.findPatient',
}

export const apiBase = 'https://o2.openmrs.org/openmrs/ws/rest/v1'
