export const JWT_SECRET =
  process.env.JWT_SECRET || 'bXlfc3VwZXJfc2VjcmV0X3BocmFzZQ==';

export const ACTIONS_DO_NOTHING = 'nothing';
export const ACTIONS_CONTINUE = 'continue';
export const ACTIONS_CHAT_ALERT_NOTIFICATION = 'chat_alert_notification';
export const ACTIONS_ALERT_NOTIFICATION = 'alert_notification';
export const ACTIONS_CHAT_NOTIFICATION = 'send_error_chat_message';
export const ACTIONS_INVALID_PASSWORD_NOTIFICATION =
  'send_wrong_password_chat_message';
export const ACTIONS_BLOCKED_USER_NOTIFICATION =
  'send_blocked_user_chat_message';

//codigos de archivos para facilitar la identificacion del origen de una respuesta/error

//controllers codigo 100x
export const AUTH_CONTROLLER_CODE = '1001';
export const ROOT_CONTROLLER_CODE = '1003';
export const SANITIZE_CONTROLLER_CODE = '1002';
export const BLOCKED_CONNECTION_CONTROLLER_CODE = '1004';

//middleware codigo 200x
export const INVALID_ROUTE_CODE = '2001';
export const JSON_ERROR_HANDLER_CODE = '2002';
export const LANGUAGE_VALIDATION_CODE = '2003';
export const RATE_LIMIT_CODE = '2004';
export const SANITIZE_REQUEST_CODE = '2005';
export const TIME_OUT_CODE = '2006';
export const VALIDATE_CONNECTION_TOKEN_CODE = '2007';
export const VALIDATE_REQUEST_BODY_CODE = '2008';
export const VALIDATE_REQUEST_HEADERS_CODE = '2009';
export const VALIDATE_BLOCKED_CONNECTIONS_CODE = '2010';
