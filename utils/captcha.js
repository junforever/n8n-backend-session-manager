import svgCaptcha from 'svg-captcha';
import NodeCache from 'node-cache';

const captchaCache = new NodeCache();

export function generateCaptcha(userId) {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 3,
    color: true,
    ignoreChars: '0o1il',
    background: '#ccf',
    width: 150,
    height: 50,
  });

  captchaCache.set(`captcha_${userId}`, captcha.text, 300); // TTL 5 minutos
  return captcha.data;
}

export function verifyCaptcha(userId, input) {
  const expected = captchaCache.get(`captcha_${userId}`);
  if (!expected) return false;
  const isValid = input.trim().toLowerCase() === expected.toLowerCase();
  if (isValid) captchaCache.del(`captcha_${userId}`);
  return isValid;
}
