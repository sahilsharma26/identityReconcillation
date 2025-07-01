import { ContactModel } from '../models/ContactModel';
import { IdentifyRequest, ContactResponse, ContactData } from '../types';
import { Prisma } from '@prisma/client'; 

export class IdentityService {
  static async identifyContact(request: IdentifyRequest): Promise<ContactResponse> {
    const { email, phoneNumber } = request;
    const existingContacts = await ContactModel.findByEmailOrPhone(email, phoneNumber);
    
    if (existingContacts.length === 0) {
      const newContact = await ContactModel.create({
        email: email === undefined ? null : email, 
        phoneNumber: phoneNumber === undefined ? null : phoneNumber, 
        linkPrecedence: 'primary'
      } as Prisma.ContactCreateArgs['data']); 
      
      return this.formatResponse([newContact]);
    }
    
    // Group contacts by their primary contact
    const contactGroups = await this.groupContactsByPrimary(existingContacts);
    
    if (contactGroups.length === 1) {
      // All contacts belong to same primary, check if we need to create secondary
      const allContacts = contactGroups[0];
      const needsNewSecondary = this.needsNewSecondary(allContacts, email, phoneNumber);
      
      if (needsNewSecondary) {
        const primaryContact = allContacts.find(c => c.linkPrecedence === 'primary')!;
        const newSecondary = await ContactModel.create({
          // Convert undefined to null for Prisma compatibility
          email: email === undefined ? null : email, 
          phoneNumber: phoneNumber === undefined ? null : phoneNumber, 
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary'
        } as Prisma.ContactCreateArgs['data']);
        
        allContacts.push(newSecondary);
      }
      
      return this.formatResponse(allContacts);
    }
    
    // Multiple primary contacts need to be merged
    return await this.mergeContacts(contactGroups, email, phoneNumber);
  }
  
  private static async groupContactsByPrimary(contacts: ContactData[]): Promise<ContactData[][]> {
    const groups: Map<number, ContactData[]> = new Map();
    
    for (const contact of contacts) {
      const primaryId = contact.linkPrecedence === 'primary' ? contact.id : contact.linkedId!;
      // Ensure primaryId is valid before fetching linked contacts
      if (primaryId) {
        const linkedContacts = await ContactModel.findLinkedContacts(primaryId);
        groups.set(primaryId, linkedContacts);
      }
    }
    
    return Array.from(groups.values());
  }
  
  private static needsNewSecondary(contacts: ContactData[], email?: string, phoneNumber?: string): boolean {
    const hasExactMatch = contacts.some(contact => 
      contact.email === email && contact.phoneNumber === phoneNumber
    );
    
    if (hasExactMatch) {
      return false;
    }
    
    // Check if the combination of email and phoneNumber is new
    const emails = new Set(contacts.map(c => c.email).filter((e): e is string => e !== null && e !== undefined));
    const phones = new Set(contacts.map(c => c.phoneNumber).filter((p): p is string => p !== null && p !== undefined));
    
    const hasNewEmail = email && !emails.has(email);
    const hasNewPhone = phoneNumber && !phones.has(phoneNumber);
    
    return (!!hasNewEmail || !!hasNewPhone);
  }
  
  private static async mergeContacts(
    contactGroups: ContactData[][],
    email?: string,
    phoneNumber?: string
  ): Promise<ContactResponse> {
    return await ContactModel.transaction(async () => {
      // Find the oldest primary contact
      const primaryContacts = contactGroups.map(group => 
        group.find(c => c.linkPrecedence === 'primary')!
      );
      
      primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const oldestPrimary = primaryContacts[0];
      
      // Merge all contacts under the oldest primary
      const allContacts: ContactData[] = [];
      
      for (const group of contactGroups) {
        for (const contact of group) {
          if (contact.id === oldestPrimary.id) {
            allContacts.push(contact);
          } else if (contact.linkPrecedence === 'primary') {
            // Convert this primary to secondary
            const updatedContact = await ContactModel.updateLinkPrecedence(contact.id, oldestPrimary.id);
            allContacts.push(updatedContact);
          } else {
            // Update secondary to point to new primary
            const updatedContact = await ContactModel.updateLinkPrecedence(contact.id, oldestPrimary.id);
            allContacts.push(updatedContact);
          }
        }
      }
      
      // Check if we need to create a new secondary for the request
      const needsNewSecondary = this.needsNewSecondary(allContacts, email, phoneNumber);
      
      if (needsNewSecondary) {
        const newSecondary = await ContactModel.create({
          // Convert undefined to null for Prisma compatibility
          email: email === undefined ? null : email, 
          phoneNumber: phoneNumber === undefined ? null : phoneNumber, 
          linkedId: oldestPrimary.id,
          linkPrecedence: 'secondary'
        } as Prisma.ContactCreateArgs['data']); // Explicitly cast the data object
        
        allContacts.push(newSecondary);
      }
      
      return this.formatResponse(allContacts);
    });
  }
  
  private static formatResponse(contacts: ContactData[]): ContactResponse {
    // It's safer to check if primary exists before asserting with '!'
    const primary = contacts.find(c => c.linkPrecedence === 'primary');
    if (!primary) {
        // Handle case where no primary contact is found, perhaps throw an error or return an appropriate response.
        throw new Error("No primary contact found in the formatted response set.");
    }

    const secondaries = contacts.filter(c => c.linkPrecedence === 'secondary');
    
    const emails = Array.from(new Set(
      contacts.map(c => c.email).filter((email): email is string => email !== null && email !== undefined)
    ));

    const phoneNumbers = Array.from(new Set(
      contacts.map(c => c.phoneNumber).filter((phone): phone is string => phone !== null && phone !== undefined)
    ));
    
    if (primary.email) {
      const index = emails.indexOf(primary.email);
      if (index > -1) { 
        emails.splice(index, 1);
        emails.unshift(primary.email);
      }
    }
    
    if (primary.phoneNumber) {
      const index = phoneNumbers.indexOf(primary.phoneNumber);
      if (index > -1) { 
        phoneNumbers.splice(index, 1);
        phoneNumbers.unshift(primary.phoneNumber);
      }
    }
    
    return {
      contact: {
        primaryContactId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaries.map(c => c.id)
      }
    };
  }
}