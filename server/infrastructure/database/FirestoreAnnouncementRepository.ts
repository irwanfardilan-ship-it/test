import { Announcement } from '../../../src/types';
import { db } from '../../db';

export class FirestoreAnnouncementRepository {
  async save(ann: Omit<Announcement, 'id' | 'date'>): Promise<Announcement> {
    return await db.saveAnnouncement(ann);
  }
  async getAll(): Promise<Announcement[]> {
    return await db.getAllAnnouncements();
  }
}
