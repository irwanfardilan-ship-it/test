import { ActivityLog } from '../../../src/types';
import { db } from '../../db';

export class FirestoreLogRepository {
  async save(log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    await db.saveLog(log);
  }
  async getAll(): Promise<ActivityLog[]> {
    return await db.getAllLogs();
  }
}
