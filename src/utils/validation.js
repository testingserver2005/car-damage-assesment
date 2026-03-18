import * as yup from 'yup'

export const userDetailsSchema = yup.object({
  name: yup
    .string()
    .required('Navn er påkrævet')
    .min(2, 'Navnet skal være mindst 2 tegn')
    .max(100, 'Navnet må ikke overstige 100 tegn'),
  email: yup
    .string()
    .required('E-mailadresse er påkrævet')
    .email('Indtast venligst en gyldig e-mailadresse'),
  mobile: yup
    .string()
    .required('Mobilnummer er påkrævet'),
    // .matches(/^\+45\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/, 'Indtast venligst et gyldigt mobilnummer'),
  address: yup
    .string()
    .required('Adresse er påkrævet')
    .min(10, 'Adressen skal være mindst 10 tegn')
    .max(500, 'Adressen må ikke overstige 500 tegn'),
  carNumberPlate: yup
    .string()
    .required('Nummerplade er påkrævet')
    .min(3, 'Nummerpladen skal være mindst 3 tegn')
    .max(20, 'Nummerpladen må ikke overstige 20 tegn'),
  serviceType: yup
    .string()
    .required('Vælg venligst en servicetype')
    .oneOf(['Forsikring', 'selvbetalt'], 'Vælg venligst en gyldig servicetype')
})

export const damageAssessmentSchema = yup.object({
  damages: yup
    .array()
    .of(
      yup.object({
        id: yup.string().required(),
        area: yup.string().required(),
        severity: yup.string().oneOf(['light', 'moderate', 'severe']).required(),
        comment: yup.string().max(500, 'Kommentaren må ikke overstige 500 tegn')
      })
    )
    .min(1, 'Vælg venligst mindst ét skadesområde'),
  images: yup
    .array()
    .of(yup.mixed())
    .min(1, 'Tilføj minimum 1 billede.')
    .max(10, 'Maksimalt 10 billeder er tilladt')
})