
// jwt-backend-session/language.js
import cldFactory from 'cld3-asm';

let detectorInstance = null;

export async function detectLanguage(text) {
  if (!detectorInstance) {
    detectorInstance = await cldFactory.load();
  }
  return detectorInstance.findLanguage(text);
}
