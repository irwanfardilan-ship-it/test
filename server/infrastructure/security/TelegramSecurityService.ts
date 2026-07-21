import crypto from 'crypto';

export class TelegramSecurityService {
  constructor(private token: string) {}

  async verify(initData: string): Promise<boolean> {
    if (!initData || !this.token) return false;
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      if (!hash) return false;

      // Filter out hash and sort
      const keys = Array.from(urlParams.keys()).filter(k => k !== 'hash').sort();
      const dataCheckString = keys.map(k => `${k}=${urlParams.get(k)}`).join('\n');

      // Calculate HMAC-SHA256
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(this.token).digest();
      const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      return hmac === hash;
    } catch (e) {
      console.error('[TelegramSecurityService] Error verifying hash:', e);
      return false;
    }
  }
}
