import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import * as mongoose from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  //! ---- SIGNUP -----
  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
    console.log('Mutation: signup');
    console.log('input: ', input);
    return this.memberService.signup(input);
  }

  //! ---- LOGIN -----
  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    console.log('Mutation: login');
    return this.memberService.login(input);
  }

  //! ---- CHECK_AUTH -----
  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(@AuthMember() member: Member): Promise<string> {
    console.log('Query: checkAuth');
    const { memberNick, _id } = member;
    console.log('memberNick ->', memberNick, '|', _id);
    return `check auth executed! ${memberNick}`;
  }

  //! ---- CHECK_AUTH_ROLES -----
  @Roles(MemberType.USER, MemberType.AGENT)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRoles(@AuthMember() member: Member): Promise<string> {
    console.log('Query: checkAuthRoles');

    return `checkAuthRoles executed! ${member.memberNick}, you are ${member.memberType} and your ID is $${member._id}`;
  }

  //! ---- UPDATE_MEMBER -----
  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: mongoose.ObjectId,
  ): Promise<Member> {
    console.log('Mutation: updateMember');
    delete input._id;
    console.log('memberId', memberId);
    console.log('membe      rId ->', memberId);
    return this.memberService.updateMember(memberId, input);
  }

  //! ---- GET_MEMBER -----
  @Query(() => Member)
  public async getMember(@Args('memberId') input: string): Promise<Member> {
    console.log('Mutation: getMember');
    const target = shapeIntoMongoObjectId(input);
    return this.memberService.getMember(target);
  }

  //*     ADMIN

  //* Authorization: ADMIN
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => String)
  public async getAllMembersByAdmin(): Promise<string> {
    return this.memberService.getAllMembersByAdmin();
  }

  //* Authorization: ADMIN
  @Mutation(() => String)
  public async updateMemberByAdmin(): Promise<string> {
    return this.memberService.updateMemberByAdmin();
  }
}
