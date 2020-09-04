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
    console.log(resp, 'index resp');
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

    console.log(slotApptDt, apptDt, slot, appointment.doctorId, 'appoint date time');

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