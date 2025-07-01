import prisma from '../config/database';
import { ContactData } from '../types';
import { Prisma } from '@prisma/client'; 

export class ContactModel {
  static async findByEmailOrPhone(email?: string, phoneNumber?: string): Promise<ContactData[]> {
    const whereConditions: any[] = [];
    
    if (email) {
      whereConditions.push({ email });
    }
    
    if (phoneNumber) {
      whereConditions.push({ phoneNumber });
    }
    
    if (whereConditions.length === 0) {
      return [];
    }
    
    return await prisma.contact.findMany({
      where: {
        OR: whereConditions,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
  
  static async findLinkedContacts(primaryId: number): Promise<ContactData[]> {
    return await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryId },
          { linkedId: primaryId }
        ],
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
  
  static async create(data: Prisma.ContactCreateArgs['data']): Promise<ContactData> {
    return await prisma.contact.create({
      data
    });
  }
  
  static async updateLinkPrecedence(id: number, linkedId: number): Promise<ContactData> {
    return await prisma.contact.update({
      where: { id },
      data: {
        linkedId,
        linkPrecedence: 'secondary',
        updatedAt: new Date()
      }
    });
  }
  
  static async findById(id: number): Promise<ContactData | null> {
    return await prisma.contact.findUnique({
      where: { id, deletedAt: null }
    });
  }
  
  static async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return await prisma.$transaction(callback);
  }
}