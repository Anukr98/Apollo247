//create doctor index. this file is just use to store index, not imported in any code. 
const doctorIndex = {
  mappings: {
    properties: {
      age: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      awards: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      city: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      consultHours: {
        properties: {
          actualDay: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          consultBuffer: { type: 'long' },
          consultDuration: { type: 'long' },
          consultHoursId: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          consultMode: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          consultType: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          endTime: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          isActive: { type: 'boolean' },
          slotsPerHour: { type: 'long' },
          startTime: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          weekDay: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        },
      },
      country: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      createdDate: { type: 'date' },
      dateOfBirth: { type: 'date' },
      delegateName: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      delegateNumber: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      displayName: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      doctorHospital: {
        properties: {
          createdDate: { type: 'date' },
          facility: {
            properties: {
              city: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
              country: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              createdDate: { type: 'date' },
              facilityType: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              id: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
              imageUrl: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              latitude: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              longitude: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              name: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
              state: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
              streetLine1: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              streetLine2: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              updatedDate: { type: 'date' },
              zipcode: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
            },
          },
          id: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        },
      },
      doctorId: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      doctorSecratry: { type: 'object' },
      doctorSlots: {
        properties: {
          slotDate: { type: 'date' },
          slots: {
            type: 'nested',
            properties: {
              slot: { type: 'date' },
              slotId: { type: 'long' },
              slotThreshold: { type: 'date' },
              slotType: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              status: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
            },
          },
        },
      },
      doctorType: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      emailAddress: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      experience: { type: 'long' },
      experience_range: {
        type: 'text',
        fields: { keyword: { type: 'keyword', ignore_above: 256 } },
      },
      facility: {
        properties: {
          city: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          country: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          docFacilityId: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          facilityId: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          facilityType: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          imageUrl: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          latitude: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          location: { type: 'geo_point' },
          longitude: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          name: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          state: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          streetLine1: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          streetLine2: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          zipcode: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        },
      },
      fee_range: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      firebaseToken: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      firstName: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      fullName: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      gender: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      isActive: { type: 'boolean' },
      isApolloJdRequired: { type: 'boolean' },
      isJdAllowed: { type: 'boolean' },
      isSearchable: { type: 'boolean' },
      languages: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      lastName: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      middleName: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      mobileNumber: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      onlineConsultationFees: { type: 'long' },
      onlineStatus: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      photoUrl: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      physicalConsultationFees: { type: 'long' },
      qualification: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      query: {
        properties: {
          term: {
            properties: {
              firstName: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
            },
          },
        },
      },
      registrationNumber: {
        type: 'text',
        fields: { keyword: { type: 'keyword', ignore_above: 256 } },
      },
      salutation: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      signature: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      skipAutoQuestions: { type: 'boolean' },
      specialization: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      specialty: {
        properties: {
          commonSearchTerm: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          createdDate: { type: 'date' },
          displayOrder: { type: 'long' },
          image: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          name: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
          specialistPluralTerm: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          specialistSingularTerm: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          specialtyId: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
          updatedDate: { type: 'date' },
          userFriendlyNomenclature: {
            type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } },
          },
        },
      },
      state: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      statusChangeTime: { type: 'date' },
      streetLine1: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      streetLine2: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      streetLine3: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      thumbnailUrl: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
      updatedDate: { type: 'date' },
      zip: { type: 'text', fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
    },
  },
  settings: { index: { number_of_shards: '1', blocks: { write: 'false' } } },
};

export async function createDoctorIndex() {
  try {
    const response = await fetch(
      `${process.env.ELASTIC_CONNECTION_URL}/${process.env.ELASTIC_INDEX_DOCTORS}`,
      {
        method: 'PUT',
        body: JSON.stringify(doctorIndex),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.json();
  } catch (e) {
    throw new Error('DOCTOR_INDEX_NOT_CREATED');
  }
}

export async function deleteDoctorIndex() {
  try {
    const response = await fetch(
      `${process.env.ELASTIC_CONNECTION_URL}/${process.env.ELASTIC_INDEX_DOCTORS}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.json();
  } catch (e) {
    throw new Error('DOCTOR_INDEX_NOT_DELETED');
  }
}