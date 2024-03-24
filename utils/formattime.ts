import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function formattime(time: Date, format = 'YYYYMMDDHHmmss') {
  return dayjs(time).utc().format(format);
}
