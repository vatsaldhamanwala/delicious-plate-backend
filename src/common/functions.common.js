import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

export const generatePublicId = () => {
  return uuidv4();
};

export const setTimesTamp = () => {
  return dayjs().unix();
};
