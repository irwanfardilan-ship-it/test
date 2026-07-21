import { User, UserRole, UserStatus } from '../../../src/types';
import { db } from '../../db';

export class UserEntity {
    constructor(private data: User) {}
    toJSON(): User { return this.data; }
    get telegramId(): string { return this.data.telegramId; }
    get firstName(): string { return this.data.firstName; }
    get lastName(): string | undefined { return this.data.lastName; }
    get role(): UserRole { return this.data.role; }
    get status(): UserStatus { return this.data.status; }
    updateStatus(status: UserStatus, reason?: string) { this.data.status = status; this.data.reason = reason; }
    updateRole(role: UserRole) { this.data.role = role; }
}

export class FirestoreUserRepository {
  async getById(telegramId: string): Promise<UserEntity | null> {
    const data = await db.getUserById(telegramId);
    return data ? new UserEntity(data) : null;
  }
  async save(user: UserEntity): Promise<void> {
    await db.saveUser(user.toJSON());
  }
  async getAll(): Promise<UserEntity[]> {
    const list = await db.getAllUsers();
    return list.map(u => new UserEntity(u));
  }
}
