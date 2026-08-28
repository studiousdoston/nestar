import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import * as mongoose from 'mongoose';

import { PropertyService } from './property.service';
import { Property } from '../../libs/dto/property/property';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';

@Resolver()
export class PropertyResolver {
  constructor(private readonly propertyService: PropertyService) {}

  //! ---- CREATE_PROPERTY -----
  @Roles(MemberType.AGENT)
  @UseGuards(RolesGuard)
  @Mutation(() => Property)
  public async createProperty(
    @Args('input') input: PropertyInput,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Property> {
    console.log('Mutation createProperty');
    input.memberId = memberId;
    return this.propertyService.createProperty(input);
  }
}
