import { createResponse } from '../utils/requestResponse.js';
import { ACTIONS_CONTINUE } from '../constants/constants.js';

export const sanitizeRequest = (req, res) => {
  res.json(createResponse(true, ACTIONS_CONTINUE, req.body));
};
