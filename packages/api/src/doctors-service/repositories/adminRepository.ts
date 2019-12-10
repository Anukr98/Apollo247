import { EntityRepository, Repository } from 'typeorm';
import { Doctor, Facility, AdminUsers } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(Doctor)
export class AdminDoctor extends Repository<Doctor> {
  getAllDoctors(offset?: number, limit?: number) {
    return this.find({
      relations: [
        'specialty',
        'doctorHospital',
        'consultHours',
        'starTeam',
        'bankAccount',
        'packages',
        'doctorHospital.facility',
        'starTeam.associatedDoctor',
        'starTeam.associatedDoctor.specialty',
        'starTeam.associatedDoctor.doctorHospital',
        'starTeam.associatedDoctor.doctorHospital.facility',
      ],
      skip: offset,
      take: limit,
      order: { firstName: 'ASC' },
    });
  }

  searchByMobileNumber(mobileNumber: string) {
    return this.findOne({
      where: [{ mobileNumber }],
    });
  }

  createDoctor(doctor: Partial<Doctor>) {
    return this.save(doctor).catch((saveDoctorsError) => {
      throw new AphError(AphErrorMessages.SAVE_DOCTORS_ERROR, undefined, {
        saveDoctorsError,
      });
    });
  }
}

@EntityRepository(Facility)
export class AdminFacility extends Repository<Facility> {
  getAllFacilities(offset?: number, limit?: number) {
    return this.find({ skip: offset, take: limit });
  }
}

@EntityRepository(AdminUsers)
export class AdminUser extends Repository<AdminUsers> {
  checkValidAccess(mobileNumber: string, isActive: boolean) {
    return this.findOne({
      where: [{ mobileNumber, isActive }],
    });
  }
}
