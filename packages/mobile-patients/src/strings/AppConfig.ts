const Configuration = {
  MEDICINE_PAST_SEARCHES_SHOW_COUNT: 5,
  PAYMENT_GATEWAY_BASE_URL: 'https://aph.dev.pmt.popcornapps.com',
  PAYMENT_GATEWAY_SUCCESS_PATH: '/mob?',
  PAYMENT_GATEWAY_ERROR_PATH: '/mob-error?',
  MIN_CART_VALUE_FOR_FREE_DELIVERY: 199,
  DELIVERY_CHARGES: 25,
  PRAKTISE_API_KEY: '4A8C9CCC-C5A3-11E9-9A19-8C85900A8328',
};

export const NeedHelp = [
  {
    category: 'Virtual Consult',
    options: [
      'Delay in consult',
      'No updates on delays, reschedules or cancellations of the consult',
      'Payment issues',
      'Delayed Prescription',
      'Behavior and Attitude of the doctor',
      'Application issues (bandwidth & payment errors)',
      'Doctor not available',
      'No past / Upcoming consultation details',
      'How to consult virtually – demo video',
    ],
  },
  {
    category: 'Pharmacy',
    options: [
      'Payment Issues in online pharmacy payments',
      'Area pharmacy store not found on app',
      'Difference in quantity of medicine delivered',
      'Excess amount charged on delivery Delay in Pharmacy Order',
      'Medicines not delivered',
      'Incorrect medicines',
      'Issues in Order confirmations',
      'Orders cancelled without any information',
      'Order Cancelled, No Refund',
      'Inappropriate Attitude and Behavior of Pharmacy staff',
      'Updates in Order delivery or status of the order',
      'Software - Not User Friendly',
    ],
  },
  {
    category: 'Physical Consult',
    options: [
      'Long Waiting time for Physical consult',
      'No updates on delays, reschedules or cancellations of the consult',
      'Payment issues',
      'Delayed Prescription',
      'Behavior and Attitude of the doctor',
      'Application issues(bandwidth & payment errors)',
      'Doctor not available',
      'App appointment dishonored at confirmed time slot',
      'No past / Upcoming consultation details',
      "Can't find Doctor’s name in respective list",
    ],
  },
  {
    category: 'Health Records',
    options: [
      'Incomplete health records',
      'Delay in responses to Queries',
      'Personal details are not editable',
      'Unable to see my reports',
      'No / Wrong UHID',
      'Add multiple UHID’s linked to other mobile numbers',
      'No records available for linked UHID',
      'Issues in downloading the records',
    ],
  },
  {
    category: 'Feedback',
    options: [
      'Feedback on Consultation',
      'Feedback on Health Records',
      'Feedback on Medicine Deliver',
    ],
  },
];

type SpecialitiesType = {
  [key: string]: string[];
};

const Specialities: SpecialitiesType = {
  Cardiology: ['Cardiologist', 'Cardiologists'],
  Neurology: ['Neurologist', 'Neurologists'],
  Orthopaedics: ['Orthopaedician', 'Orthopaedicians'],
  Pulmonology: ['Pulmonologist', 'Pulmonologists'],
  Obstetrics: ['Obstetrician', 'Obstetricians'],
  Gastroenterology: ['Gastroenterologist', 'Gastroenterologists'],
  'General (MBBS)': ['General Physician', 'General Physicians'],
  'General Medicine': ['General Physician', 'General Physicians'],
  Dermatology: ['Dermatologist', 'Dermatologists'],
  Diabetology: ['Diabetologist', 'Diabetologists'],
  Dietician: ['Dietician', 'Dieticians'],
  Paediatrics: ['Paediatrician', 'Paediatricians'],
  ENT: ['ENT Specialist', 'ENT Specialists'],
  Opthalmology: ['Opthalmologist', 'Opthalmologists'],
  Oncology: ['Oncologist', 'Oncologists'],
  Radiology: ['Radiologist', 'Radiologists'],
  Nephrology: ['Nephrologist', 'Nephrologists'],
  Urology: ['Urologist', 'Urologists'],
  Podiatry: ['Podiatrician', 'Podiatricians'],
  'General Surgeon': ['General Surgeon', 'General Surgeons'],
  'Vascular Surgery': ['Vascular Surgeon', 'Vascular Surgeons'],
  Gynaecology: ['Gynaecologist', 'Gynaecologists'],
};

export const AppConfig = {
  Configuration,
  Specialities,
};
