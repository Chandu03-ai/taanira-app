import { PincodeData } from '../types/address';

class PincodeService {
  private cache = new Map<string, PincodeData>();

  async getPincodeData(pincode: string): Promise<PincodeData | null> {
    if (this.cache.has(pincode)) {
      return this.cache.get(pincode)!;
    }

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        const pincodeData: PincodeData = {
          pincode,
          block: postOffice.Block || '',
          city: postOffice.District || '',
          state: postOffice.State || '',
          district: postOffice.District || '',
        };

        this.cache.set(pincode, pincodeData);
        return pincodeData;
      }
    } catch (error) {
      console.error('Public pincode API failed:', error);
    }

    return null;
  }

  validatePincode(pincode: string): boolean {
    return /^[1-9][0-9]{5}$/.test(pincode);
  }

  validateMobileNumber(mobile: string): boolean {
    return /^[6-9]\d{9}$/.test(mobile);
  }
}

export const pincodeService = new PincodeService();
