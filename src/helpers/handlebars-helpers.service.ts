import { Injectable } from '@nestjs/common';

@Injectable()
export class HandlebarsHelpers {
  length(value: any) {
    if (Array.isArray(value)) {
      return value.length;
    } else if (typeof value === 'string') {
      return value.length;
    } else {
      return 0;
    }
  }
}
