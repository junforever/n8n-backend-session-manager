import { createResponse } from '../utils/requestResponse.js';

export const root = (req, res) => {
  res.json(
    createResponse(
      true,
      process.env.ACTIONS_DO_NOTHING || '',
      'Welcome to n8n backend api management',
    ),
  );
};

export const sanitizeRequest = (req, res) => {
  res.json(createResponse(true, process.env.ACTIONS_CONTINUE || '', req.body));
};
