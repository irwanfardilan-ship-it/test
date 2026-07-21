import { FirestoreUserRepository, UserEntity } from '../../infrastructure/database/FirestoreUserRepository';
import { JwtTokenProvider } from '../../infrastructure/security/JwtTokenProvider';
import { User } from '../../../src/types';

export class ConnectTelegramManualUseCase {
  constructor(
    private userRepo: FirestoreUserRepository,
    private jwt: JwtTokenProvider
  ) {}

  async execute(data: { username: string; firstName: string; lastName?: string }): Promise<any> {
    const { username, firstName, lastName } = data;
    if (!username) {
      throw new Error('Username Telegram wajib diisi.');
    }

    const cleanUsername = username.replace('@', '').trim();
    
    // Find if user already exists
    const allUsers = await this.userRepo.getAll();
    let existingUser = allUsers.find(u => u.toJSON().username?.toLowerCase() === cleanUsername.toLowerCase());

    if (!existingUser) {
      // Create new user
      const newTelegramId = String(Math.floor(10000000 + Math.random() * 90000000));
      const newUser: User = {
        telegramId: newTelegramId,
        username: cleanUsername,
        firstName: firstName || 'User',
        lastName: lastName || '',
        photoUrl: '',
        role: 'Member',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const userEntity = new UserEntity(newUser);
      await this.userRepo.save(userEntity);
      existingUser = userEntity;
    }

    const userObj = existingUser.toJSON();
    const token = this.jwt.generateToken({
      telegramId: userObj.telegramId,
      username: userObj.username,
      role: userObj.role,
      status: userObj.status
    });

    return { token, user: userObj };
  }
}
