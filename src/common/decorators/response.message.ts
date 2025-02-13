import { SetMetadata } from '@nestjs/common';

// Custom decorator that will hold the response message
export const RESPONSE_MESSAGE_KEY = 'responseMessage';

export const ResponseMessage = (message: string) => {
  return SetMetadata(RESPONSE_MESSAGE_KEY, message);
};
