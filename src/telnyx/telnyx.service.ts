import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Telnyx from 'telnyx';

@Injectable()
export class TelnyxService {
  private telnyxClient: Telnyx;
  private messagingProfileId: string;

  constructor(private configService: ConfigService) {
    this.telnyxClient = new Telnyx(configService.get('TELNYX_API_KEY')!);
    this.messagingProfileId =
      this.configService.get<string>('TELNYX_MESSAGING_PROFILE_ID') ?? '';
  }

  /**
   * Get available phone numbers
   * @param filters - number of phone numbers to fetch
   */
  async getAvailableNumbers(filters: Record<string, any>) {
    try {
      const response = await this.telnyxClient.availablePhoneNumbers.list({
        ...filters,
      });

      return response; // List of available phone numbers
    } catch (error) {
      throw new Error(`Failed to fetch numbers: ${error.message}`);
    }
  }

  //   /**
  //    * Buy multiple phone numbers
  //    * @param phoneNumbers - Array of phone numbers to buy
  //    */

  async buyNumbers(phoneNumbers: string[]) {
    if (!phoneNumbers || phoneNumbers.length === 0) {
      throw new InternalServerErrorException(
        'Phone number list cannot be empty',
      );
    }

    try {
      const response = await this.telnyxClient.numberOrders.create({
        phone_numbers: phoneNumbers.map((number) => ({ phone_number: number })),
        messaging_profile_id: this.messagingProfileId,
      });

      return response.data?.id;
    } catch (error) {
      console.error('Telnyx Buy Numbers Error:', error.message);
      throw new InternalServerErrorException(`Failed to buy numbers`);
    }
  }

  /**
   * Retrieve purchased phone numbers
   */
  async getPurchasedNumbers() {
    try {
      const response = await this.telnyxClient.numberOrders.list();
      if (response.data) {
        return response;
      }
      // Extract phone numbers from the response
    } catch (error) {
      console.error('Telnyx Retrieve Numbers Error:', error.message);
      throw new InternalServerErrorException(
        `Failed to retrieve purchased numbers: ${error.message}`,
      );
    }
  }
}
