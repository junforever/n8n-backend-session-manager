import { formatInTimeZone } from 'date-fns-tz';

export const dateTimeEcuador = () => {
  const now = new Date();
  const ecuadorTime = formatInTimeZone(
    now,
    'America/Guayaquil',
    'yyyy-MM-dd HH:mm:ss',
  );
  return ecuadorTime;
};
