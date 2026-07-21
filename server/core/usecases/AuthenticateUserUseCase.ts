import { FirestoreUserRepository, UserEntity } from '../../infrastructure/database/FirestoreUserRepository';
import { TelegramSecurityService } from '../../infrastructure/security/TelegramSecurityService';
import { JwtTokenProvider } from '../../infrastructure/security/JwtTokenProvider';
import { User } from '../../../src/types';

export class AuthenticateUserUseCase {
  constructor(
    private userRepo: FirestoreUserRepository,
    private verifier: TelegramSecurityService,
    private jwt: JwtTokenProvider,
    private botEnabled: boolean
  ) {}

  async execute(initData: string): Promise<any> {
    if (!initData) {
      throw new Error('Data init Telegram kosong.');
    }

    // Parse initData
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) {
      throw new Error('Data pengguna tidak ditemukan dalam initData.');
    }

    let tgUser: any;
    try {
      tgUser = JSON.parse(decodeURIComponent(userStr));
    } catch (e) {
      throw new Error('Format data pengguna tidak valid.');
    }

    const telegramId = String(tgUser.id);
    if (!telegramId) {
      throw new Error('ID Telegram tidak ditemukan.');
    }

    // Verify hash if bot is enabled
    if (this.botEnabled) {
      const isValid = await this.verifier.verify(initData);
      if (!isValid) {
        throw new Error('Verifikasi tanda tangan Telegram gagal.');
      }
    }

    // Get or create user
    let userEntity = await this.userRepo.getById(telegramId);
    
    if (!userEntity) {
      // Create new member
      const newUser: User = {
        telegramId,
        username: tgUser.username || `user_${telegramId}`,
        firstName: tgUser.first_name || 'User',
        lastName: tgUser.last_name || '',
        photoUrl: tgUser.photo_url || '',
        role: 'Member',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      userEntity = new UserEntity(newUser);
      await this.userRepo.save(userEntity);
    } else {
      // Update existing user details from Telegram WebApp
      const user = userEntity.toJSON();
      user.username = tgUser.username || user.username;
      user.firstName = tgUser.first_name || user.firstName;
      user.lastName = tgUser.last_name || user.lastName;
      user.photoUrl = tgUser.photo_url || user.photoUrl;
      user.updatedAt = new Date().toISOString();
      await this.userRepo.save(userEntity);
    }

    const userObj = userEntity.toJSON();
    const token = this.jwt.generateToken({
      telegramId: userObj.telegramId,
      username: userObj.username,
      role: userObj.role,
      status: userObj.status
    });

    return { token, user: userObj };
  }
}
