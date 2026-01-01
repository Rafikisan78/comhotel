import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendEmail(to: string, subject: string, body: string) {
    // Mock email service
    console.log(`Sending email to ${to}: ${subject}`);
    return true;
  }
}
