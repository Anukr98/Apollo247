import React from 'react';
import Dayz from 'dayz';
import 'dayz/dist/dayz.css';
import * as momentRange from 'moment-range';
import * as momentConstructor from 'moment';

const moment = momentRange.extendMoment(momentConstructor);
const date = moment('2019-07-13');
const EVENTS = new Dayz.EventsCollection([
  {
    content: 'A short event',
    range: moment.range(date.clone(),
      date.clone().add(1, 'day'))
  },
  {
    content: 'Two Hours ~ 8-10',
    range: moment.range(date.clone().hour(8),
      date.clone().hour(10))
  },
  {
    content: "A Longer Event",
    range: moment.range(date.clone().subtract(2, 'days'),
      date.clone().add(8, 'days'))
  }
]);

export const Calendar: React.FC = () => {
  return (
    <Dayz
      display='week'
      highlightDays={[date]}
      date={date}
      events={EVENTS}
    />
  );
};
