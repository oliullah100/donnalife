import crypto from 'crypto'

const generateHashedToken = (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return hashedToken;
};

export const verification = {generateHashedToken}