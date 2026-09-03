import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import * as mongoose from 'mongoose';

import { PropertyService } from './property.service';
import { Properties, Property } from '../../libs/dto/property/property';
import {
  AgentPropertiesInquiry,
  AllPropertiesInquiry,
  PropertiesInquiry,
  PropertyInput,
} from '../../libs/dto/property/property.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { AuthGuard } from '../auth/guards/auth.guard';

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

  //! ---- GET_PROPERTY -----
  @UseGuards(WithoutGuard)
  @Query(() => Property)
  public async getProperty(
    @Args('propertyId') input: string,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Property> {
    console.log('Query, getProperty');
    const propertyId = shapeIntoMongoObjectId(input);
    return await this.propertyService.getProperty(memberId, propertyId);
  }

  //! ---- UPDATE_PROPERTY -----
  @Roles(MemberType.AGENT)
  @UseGuards(RolesGuard)
  @Mutation(() => Property)
  public async updateProperty(
    @Args('input') input: PropertyUpdate,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Property> {
    console.log('Query, updateProperty');
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.propertyService.updateProperty(memberId, input);
  }

  //! ---- GET_PROPERTIES -----
  @UseGuards(WithoutGuard)
  @Query((returns) => Properties)
  public async getProperties(
    @Args('input') input: PropertiesInquiry,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Properties> {
    console.log('Query: getProperties');
    return await this.propertyService.getProperties(memberId, input);
  }

  //! ---- GET_AGENT_PROPERTIES -----
  @Roles(MemberType.AGENT)
  @UseGuards(RolesGuard)
  @Query((returns) => Properties)
  public async getAgentProperties(
    @Args('input') input: AgentPropertiesInquiry,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Properties> {
    console.log('Query: getAgentProperties');
    return await this.propertyService.getAgentProperties(memberId, input);
  }

  //! ---- LIKE_TARGET_PROPERTY -----
  @UseGuards(AuthGuard)
  @Mutation(() => Property)
  public async likeTargetProperty(
    @Args('propertyId') input: string,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Property> {
    console.log('Mutation: likeTargetMember');
    const likeRefId = shapeIntoMongoObjectId(input);
    return await this.propertyService.likeTargetProperty(memberId, likeRefId);
  }

  //-------------------------------------------------------------
  //*                        ADMIN
  //-------------------------------------------------------------
  //! ---- GET_ALL_PROPERTIES_BY_ADMIN -----
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query((returns) => Properties)
  public async getAllPropertiesByAdmin(
    @Args('input') input: AllPropertiesInquiry,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Properties> {
    console.log('Query: getAllPropertiesByAdmin');
    return await this.propertyService.getAllPropertiesByAdmin(input);
  }

  //! ---- UPDATE_PROPERTIES_BY_ADMIN -----
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation((returns) => Property)
  public async updatePropertyByAdmin(@Args('input') input: PropertyUpdate): Promise<Property> {
    console.log('Mutation: updatePropertyByAdmin');
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.propertyService.updatePropertyByAdmin(input);
  }

  //! ---- REMOVE_PROPERTY_BY_ADMIN -----
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation((returns) => Property)
  public async removePropertyByAdmin(@Args('propertyId') input: string): Promise<Property> {
    console.log('Mutation: removePropertyByAdmin');
    const propertyId = shapeIntoMongoObjectId(input);
    return await this.propertyService.removePropertyByAdmin(propertyId);
  }
}
