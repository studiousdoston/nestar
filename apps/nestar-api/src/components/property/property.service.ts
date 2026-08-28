import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Property } from '../../libs/dto/property/property';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel('Property') private readonly propertyModel: Model<Property>,
    private readonly memberService: MemberService,
  ) {}

  //* ---- CREATE_PROPERTY -----
  public async createProperty(input: PropertyInput): Promise<Property> {
    try {
      const result = await this.propertyModel.create(input);

      // icrement agent's property
      await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberProperties', modifier: 1 });

      return result;
    } catch (err) {
      console.log('Error, PropertyService', err instanceof Error ? err.message : err);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }
}
