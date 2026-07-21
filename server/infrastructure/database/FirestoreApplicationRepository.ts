import { Application } from '../../../src/types';
import { db } from '../../db';

export class FirestoreApplicationRepository {
  async save(app: Application): Promise<void> {
    await db.saveApplication(app);
  }
  async getByTelegramId(telegramId: string): Promise<Application | null> {
    return await db.getApplicationByTelegramId(telegramId);
  }
  async getById(id: string): Promise<Application | null> {
    return await db.getApplicationById(id);
  }
  async getAll(): Promise<Application[]> {
    return await db.getAllApplications();
  }
}
