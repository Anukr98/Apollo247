import { EntityRepository, Repository, In, Between } from 'typeorm';
import { PatientHelpTickets } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { addDays } from 'date-fns';

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
    return this.count({
      where: {
        category: In(['Virtual Consult', 'Physical Consult']),
        createdDate: Between(ticketDate, addDays(ticketDate, 1)),
      },
    });
  }
}
