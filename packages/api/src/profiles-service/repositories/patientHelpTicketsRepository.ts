import { EntityRepository, Repository, In, Between } from 'typeorm';
import { PatientHelpTickets } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { addDays, format } from 'date-fns';

@EntityRepository(PatientHelpTickets)
export class PatientHelpTicketRepository extends Repository<PatientHelpTickets> {
  saveHelpTicket(helpTicketAttrs: Partial<PatientHelpTickets>) {
    return this.create(helpTicketAttrs)
      .save()
      .catch((helpTicketError) => {
        throw new AphError(AphErrorMessages.SAVE_HELP_TICKET_ERROR, undefined, {
          helpTicketError,
        });
      });
  }

  getHelpTicketCount(ticketDate: Date) {
    const inputDate = format(ticketDate, 'yyyy-MM-dd');
    const endDate = new Date(inputDate + 'T18:29');
    const inputStartDate = format(addDays(ticketDate, -1), 'yyyy-MM-dd');
    console.log(inputStartDate, 'inputStartDate find by date doctor id - calls count');
    const startDate = new Date(inputStartDate + 'T18:30');
    return this.count({
      where: {
        category: In(['Virtual Consult', 'Physical Consult']),
        createdDate: Between(startDate, endDate),
      },
    });
  }
}
