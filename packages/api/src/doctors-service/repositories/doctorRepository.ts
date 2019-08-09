import { EntityRepository, Repository } from 'typeorm';
import { Doctor } from 'doctors-service/entities';

@EntityRepository(Doctor)
export class DoctorRepository extends Repository<Doctor> {
  getDoctorDetails(firebaseToken: string) {
    return this.findOne({
      where: [{ firebaseToken }],
    });
  }

  findByMobileNumber(mobileNumber: string, isActive: Boolean) {
    return this.findOne({
      where: [{ mobileNumber, isActive }, { delegateNumber: mobileNumber, isActive: isActive }],
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
    });
  }

  updateFirebaseId(id: string, firebaseToken: string) {
    return this.update(id, { firebaseToken: firebaseToken });
  }

  findById(id: string) {
    return this.findOne({
      where: [{ id }],
      relations: [
        'specialty',
        'doctorHospital',
        'consultHours',
        'starTeam',
        'bankAccount',
        'packages',
        'doctorHospital.facility',
        'starTeam.associatedDoctor',
      ],
    });
  }

  searchByName(searchString: string) {
    return this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'doctorHospital.facility')
      .where('LOWER(doctor.firstName) LIKE :searchString', {
        searchString: `${searchString}%`,
      })
      .orWhere('LOWER(doctor.lastName) LIKE :searchString', {
        searchString: `${searchString}%`,
      })
      .orWhere("LOWER(doctor.firstName || ' ' || doctor.lastName) LIKE :searchString", {
        searchString: `${searchString}%`,
      })
      .getMany();
  }

  searchBySpecialty(specialtyId: string) {
    return this.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialty', 'specialty')
      .leftJoinAndSelect('doctor.consultHours', 'consultHours')
      .leftJoinAndSelect('doctor.doctorHospital', 'doctorHospital')
      .leftJoinAndSelect('doctorHospital.facility', 'doctorHospital.facility')
      .where('doctor.specialty = :specialtyId', {
        specialtyId,
      })
      .getMany();
  }
}
