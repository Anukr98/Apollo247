import { EntityRepository, Repository, In, Between, Not } from 'typeorm';
import { ConsultHours } from 'doctors-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Doctor } from 'doctors-service/entities';
import { WeekDay } from 'doctors-service/entities'
import { Appointment } from 'consults-service/entities';
type totalCount = {
    totalSlotsCount: number;
};
@EntityRepository(ConsultHours)
export class consultHoursRepository extends Repository<ConsultHours> {
    async getConsultHours(doctorIds: string[], weekDay: WeekDay) {
        const consult_hours = await this.find({
            where: [{
                doctor: In(doctorIds),
                weekDay
            }]
        });
        let count: number = 0;
        consult_hours.map((consult_hour) => {
            if (consult_hour.weekDay === weekDay)
                count = count + consult_hour.slotsPerHour;
        })
        return count;
    }
}
