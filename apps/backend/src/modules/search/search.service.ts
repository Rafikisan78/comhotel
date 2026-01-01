import { Injectable } from '@nestjs/common';
import { HotelsService } from '../hotels/hotels.service';

@Injectable()
export class SearchService {
  constructor(private readonly hotelsService: HotelsService) {}

  async searchHotels(query: any) {
    // Mock implementation - will implement intelligent search later
    const allHotels = await this.hotelsService.findAll();
    return allHotels;
  }
}
