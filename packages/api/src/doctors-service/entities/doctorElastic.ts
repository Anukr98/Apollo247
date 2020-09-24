import { ApiResponse, Client, RequestParams } from "@elastic/elasticsearch";
import { Doctor } from "doctors-service/entities";
import { APPOINTMENT_TYPE, ES_DOCTOR_SLOT_STATUS, Appointment } from "consults-service/entities";
import { format, addMinutes, addDays } from "date-fns";
import { AphError } from "AphError";
import { AphErrorMessages } from "@aph/universal/dist/AphErrorMessages";
import { omit } from "lodash";
import { ApiConstants, elasticConsts } from "ApiConstants";

export async function addDoctorElastic(allDocsInfo: Doctor) {
    const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
    const consultHours = [];
    for (let k = 0; k < allDocsInfo.consultHours.length; k++) {
        const hourData = {
            consultHoursId: allDocsInfo.consultHours[k].id,
        };

        Object.assign(hourData, omit(allDocsInfo.consultHours[k], 'id', 'consultHoursId', 'updatedDate', 'createdDate'));
        consultHours.push(hourData);
    }
    let doctorSecratry = {};
    let specialty = {};
    const facility = [];
    if (allDocsInfo.doctorSecretary) {
        doctorSecratry = {
            docSecretaryId: allDocsInfo.doctorSecretary.id,
            name: allDocsInfo.doctorSecretary.secretary.name,
            mobileNumber: allDocsInfo.doctorSecretary.secretary.mobileNumber,
            isActive: allDocsInfo.doctorSecretary.secretary.isActive,
            secretaryId: allDocsInfo.doctorSecretary.secretary.id,
        };

    }
    if (allDocsInfo.doctorHospital.length > 0) {
        for (let f = 0; f < allDocsInfo.doctorHospital.length; f++) {
            const location = {
                lat: allDocsInfo.doctorHospital[f].facility.latitude,
                lon: allDocsInfo.doctorHospital[f].facility.longitude,
            };
            const facilityData = {
                docFacilityId: allDocsInfo.doctorHospital[f].id,
                facilityId: allDocsInfo.doctorHospital[f].facility.id,
                location,
            };

            Object.assign(facilityData, omit(allDocsInfo.doctorHospital[f].facility, [
                'id',
                'docFacilityId',
                'facilityId',
                'location',
                'createdDate',
                'updatedDate'
            ]));
            facility.push(facilityData);
        }
    }
    if (allDocsInfo.specialty) {
        specialty = {
            specialtyId: allDocsInfo.specialty.id,
        };

        Object.assign(specialty, omit(allDocsInfo.specialty, ['id']));
    }

    function defineExperienceRange(experience: Number) {
        let experience_range: string = '';
        if (experience >= 16) {
            experience_range = '16+';
        } else if (experience > 10 && experience < 16) {
            experience_range = '11-16';
        } else if (experience > 5 && experience < 11) {
            experience_range = '6-10';
        } else {
            experience_range = '0-5';
        }
        return experience_range;
    }

    function defineFeeRange(fees: Number) {
        let fees_range: string = '';
        if (fees >= 1000) {
            fees_range = '1000+';
        } else if (fees > 500 && fees < 1000) {
            fees_range = '500-1000';
        } else {
            fees_range = '100-500';
        }
        return fees_range;
    }

    function pushLanguagesInArray(cslanguages: string) {
        return cslanguages.split(',').map((elem) => elem.trim());
    }

    const doctorData = {
        doctorId: allDocsInfo.id,
        firstName: allDocsInfo.firstName,
        lastName: allDocsInfo.lastName,
        mobileNumber: allDocsInfo.mobileNumber,
        awards: allDocsInfo.awards,
        country: allDocsInfo.country,
        dateOfBirth: allDocsInfo.dateOfBirth,
        displayName: allDocsInfo.displayName,
        delegateName: allDocsInfo.delegateName,
        delegateNumber: allDocsInfo.delegateNumber,
        emailAddress: allDocsInfo.emailAddress,
        externalId: allDocsInfo.externalId,
        fullName: allDocsInfo.fullName,

        doctorType: allDocsInfo.doctorType,
        city: allDocsInfo.city,
        experience: allDocsInfo.experience,
        physicalConsultationFees: allDocsInfo.physicalConsultationFees,
        onlineConsultationFees: allDocsInfo.onlineConsultationFees,
        age: '',
        experience_range: defineExperienceRange(allDocsInfo.experience),
        fee_range: defineFeeRange(allDocsInfo.onlineConsultationFees),
        languages: pushLanguagesInArray(allDocsInfo.languages),
        gender: allDocsInfo.gender,

        chatDays: allDocsInfo.chatDays,
        isActive: allDocsInfo.isActive,
        middleName: allDocsInfo.middleName,
        photoUrl: allDocsInfo.photoUrl,
        qualification: allDocsInfo.qualification,
        registrationNumber: allDocsInfo.registrationNumber,
        salutation: allDocsInfo.salutation,
        signature: allDocsInfo.signature,
        specialization: allDocsInfo.specialization,
        state: allDocsInfo.state,
        streetLine1: allDocsInfo.streetLine1,
        streetLine2: allDocsInfo.streetLine2,
        streetLine3: allDocsInfo.streetLine3,
        thumbnailUrl: allDocsInfo.thumbnailUrl,
        zip: allDocsInfo.zip,
        isSearchable: allDocsInfo.isSearchable,
        specialty,
        facility,
        consultHours,
        doctorSecratry,
        doctorSlots: [],
    };

    if (!process.env.ELASTIC_INDEX_DOCTORS) {
        throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
    }

    const resp: ApiResponse = await client.index({
        index: process.env.ELASTIC_INDEX_DOCTORS,
        id: allDocsInfo.id,
        body: doctorData,
    });
}


export async function updateDoctorSlotStatusES(
    doctorId: string,
    slotType: APPOINTMENT_TYPE,
    status: ES_DOCTOR_SLOT_STATUS.OPEN | ES_DOCTOR_SLOT_STATUS.BOOKED,
    appointmentDateTime: Date,
    appointment: Appointment
) {
    const slotApptDt = format(addMinutes(new Date(appointmentDateTime), +0), 'yyyy-MM-dd') + ' 18:30:00'; //format(appointmentDateTime, 'yyyy-MM-dd') + ' 18:30:00';
    const actualApptDt = format(addMinutes(new Date(appointmentDateTime), +0), 'yyyy-MM-dd'); //format(appointmentDateTime, 'yyyy-MM-dd');
    let apptDt = format(addMinutes(new Date(appointmentDateTime), +0), 'yyyy-MM-dd'); // format(appointmentDateTime, 'yyyy-MM-dd');

    if (appointmentDateTime >= new Date(slotApptDt)) {
        apptDt = format(addDays(new Date(apptDt), 1), 'yyyy-MM-dd');
    }
    const slot = `${actualApptDt}T${new Date(appointmentDateTime)
        .getUTCHours()
        .toString()
        .padStart(2, '0')}:${new Date(appointmentDateTime)
            .getUTCMinutes()
            .toString()
            .padStart(2, '0')}:00.000Z`;

    const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });

    if (!process.env.ELASTIC_INDEX_DOCTORS) {
        throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
    }

    const updateDoc: RequestParams.Update = {
        index: process.env.ELASTIC_INDEX_DOCTORS,
        id: doctorId,
        retry_on_conflict: elasticConsts.ELASTIC_CONFLICT_RETRY_COUNT,
        body: {
            script: {
                source:
                    'for (int i = 0; i < ctx._source.doctorSlots.length; ++i) { if(ctx._source.doctorSlots[i].slotDate == params.slotDate) { for(int k=0;k<ctx._source.doctorSlots[i].slots.length;k++){if(ctx._source.doctorSlots[i].slots[k].slot == params.slot){ ctx._source.doctorSlots[i].slots[k].status = params.status;}}}}',
                params: {
                    slotDate: apptDt,
                    slot,
                    slotType,
                    status,
                },
            },
        },
    };

    return await client.update(updateDoc);
}

const ES_FIELDS_PRIORITY = {
  doctor_fullName: 5,
  speciality_name: 4,
  speciality_groupName: 3,
  speciality_commonSearchTerm: 2,
  speciality_userFriendlyNomenclature: 1,
};

export function elasticDoctorTextSearch(searchText: string){
      return {
        bool: {
          should: [
            {
              multi_match: {
                fields: [
                  `fullName^${ES_FIELDS_PRIORITY.doctor_fullName}`,
                  `displayName^${ES_FIELDS_PRIORITY.doctor_fullName}`,
                  `specialty.name^${ES_FIELDS_PRIORITY.speciality_name}`,
                  `specialty.groupName^${ES_FIELDS_PRIORITY.speciality_groupName}`,
                  `specialty.symptoms^${ES_FIELDS_PRIORITY.speciality_commonSearchTerm}`,
                  `specialty.commonSearchTerm^${ES_FIELDS_PRIORITY.speciality_commonSearchTerm}`,
                  `specialty.userFriendlyNomenclature^${ES_FIELDS_PRIORITY.speciality_userFriendlyNomenclature}`,
                ],
                type: 'phrase_prefix',
                query: `*${searchText.trim().toLowerCase()}*`,
              },
            },
            {
              query_string: {
                fields: [
                  `fullName^${ES_FIELDS_PRIORITY.doctor_fullName}`,
                  `displayName^${ES_FIELDS_PRIORITY.doctor_fullName}`,
                  `specialty.name^${ES_FIELDS_PRIORITY.speciality_name}`,
                  `specialty.groupName^${ES_FIELDS_PRIORITY.speciality_groupName}`,
                  `specialty.symptoms^${ES_FIELDS_PRIORITY.speciality_commonSearchTerm}`,
                  `specialty.commonSearchTerm^${ES_FIELDS_PRIORITY.speciality_commonSearchTerm}`,
                  `specialty.userFriendlyNomenclature^${ES_FIELDS_PRIORITY.speciality_userFriendlyNomenclature}`,
                ],
                fuzziness: 'AUTO',
                query: `*${searchText.trim().toLowerCase()}*`,
              },
            },
          ],
        },
      };
}

type FilterDoctorInput = {
  availability: string[];
  availableNow: string;
  geolocation: Geolocation;
  sort: string;
};
type Geolocation = {
  latitude: number;
  longitude: number;
};

export function elasticDoctorLatestSlotFilter(){
  return {
    nested: {
      path: 'doctorSlots.slots',
      inner_hits: { size: 1 },
      query: {
        bool: {
          must: [
            { match: { 'doctorSlots.slots.status': 'OPEN' } },
            { range: { 'doctorSlots.slots.slotThreshold': { gt: 'now' } } },
          ],
        },
      },
    },
  };
}

export function elasticDoctorAvailabilityFilter(filterInput: FilterDoctorInput){
  const elasticSlotDateAvailability: { [index: string]: any } = [];
  const elasticSlotAvailabileNow: { [index: string]: any } = [];

  if (filterInput.availability && filterInput.availability.length > 0) {
    filterInput.availability.forEach((availability) => {
      elasticSlotDateAvailability.push({
        bool: {
          must: [
            {
              nested: {
                path: 'doctorSlots',
                query: {
                  bool: {
                    must: [
                      {
                        match: {
                          'doctorSlots.slotDate': availability,
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              nested: {
                path: 'doctorSlots.slots',
                query: {
                  bool: {
                    must: [
                      { match: { 'doctorSlots.slots.slot': availability } },
                      {
                        range: {
                          'doctorSlots.slots.slotThreshold': {
                            gt: 'now',
                            lt: availability + 'T18:30:00.000Z',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      });
    });
  }

  if (filterInput.availableNow) {
    elasticSlotAvailabileNow.push({
      nested: {
        path: 'doctorSlots.slots',
        query: { range: { 'doctorSlots.slots.slotThreshold': { gt: 'now', lte: 'now+4h' } } },
      },
    });
  }

  if (elasticSlotDateAvailability.length > 0 && filterInput.availableNow) {
    return {
      bool: {
        should: [
          { bool: { should: elasticSlotDateAvailability } },
          { bool: { must: elasticSlotAvailabileNow } },
        ],
      },
    };
  } else if (elasticSlotDateAvailability.length > 0) {
    return { bool: { should: elasticSlotDateAvailability } };
  } else if (filterInput.availableNow) {
    return elasticSlotAvailabileNow;
  }

}

export function elasticDoctorDistanceSort(filterInput: FilterDoctorInput){
  if (filterInput.geolocation && filterInput.sort === 'distance') {
    return {
      _geo_distance: {
        'facility.location': {
          lat: filterInput.geolocation.latitude,
          lon: filterInput.geolocation.longitude,
        },
        order: 'asc',
        unit: 'km',
      },
    };
  }
}
  
export function elasticDoctorAvailabilitySort(){ 
    return {
      'doctorSlots.slots.slot': {
        order: 'asc',
        mode: 'min',
        nested_path: 'doctorSlots.slots',
        nested_filter: {
          bool: {
            must: [
              { match: { 'doctorSlots.slots.status': 'OPEN' } },
              {
                range: {
                  'doctorSlots.slots.slotThreshold': { gt: 'now' },
                },
              },
            ],
          },
        },
      },
    };
}

export function elasticDoctorDoctorTypeSort(){ 
  return{
    _script: {
      type: 'number',
      script: {
        lang: 'painless',
        source:
          "if( doc['doctorType.keyword'].value == 'STAR_APOLLO'){ params.STAR_APOLLO }else {params.OTHERS}",
        params: {
          STAR_APOLLO: 1,
          OTHERS: 0,
        },
      },
      order: 'desc',
    },
  };
}

export function elasticDoctorSearch(
  offset: number,
  pageSize: number,
  elasticSort:{},
  elasticMatch:{}
){ 
  const searchParams: RequestParams.Search = {
     index: process.env.ELASTIC_INDEX_DOCTORS,
      body: {
        from: offset,
        size: pageSize,
        sort: elasticSort,
        _source: [
          'doctorId',
          'displayName',
          'specialty',
          'experience',
          'photoUrl',
          'thumbnailUrl',
          'qualification',
          'onlineConsultationFees',
          'physicalConsultationFees',
          'doctorType',
          'facility.name',
          'facility.city',
          'consultHours.consultMode',
        ],
        query: {
          bool: {
            must: elasticMatch,
          },
        },
        aggs: {
          doctorTypeCount: {
            terms: {
              field: 'doctorType.keyword',
            },
          },
        },
      },
    };
    return searchParams;
}
export function elasticSpecialtySearch(searchText: string) {
  const specialtiesSearchParams: RequestParams.Search = {
    index: process.env.ELASTIC_INDEX_DOCTORS,
    body: {
      size: 0,
      _source: ['specialty'],
      query: {
        bool: {
          must: [
            {
              multi_match: {
                fields: [
                  'specialty.name^5',
                  'specialty.userFriendlyNomenclature^4',
                  'specialty.specialistSingularTerm^4',
                  'specialty.symptoms^3',
                ],
                type: 'phrase_prefix',
                //fuzziness: 'AUTO',
                query: `*${searchText.trim().toLowerCase()}*`,
              },
            },
          ],
        },
      },
      aggs: {
        matched_specialities: {
          terms: {
            field: 'specialty.name.keyword',
            size: 1000,
          },
          aggs: {
            matched_specialities_hits: {
              top_hits: {
                sort: [
                  {
                    _score: {
                      order: 'desc',
                    },
                  },
                ],
                _source: ['specialty'],
                size: 1,
              },
            },
          },
        },
      },
    },
  };
  return specialtiesSearchParams;
}
