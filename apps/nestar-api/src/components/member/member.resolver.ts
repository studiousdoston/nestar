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

  //! ---- UPDATE_MEMBER -----
  @UseGuards(AuthGuard)
  @Mutation(() => String)
  public async updateMember(@AuthMember('_id') memberId: mongoose.ObjectId): Promise<string> {
    console.log('Mutation: updateMember');
    console.log('memberId ->', memberId);
    return this.memberService.updateMember();
  }

  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
    console.log('Query: checkAuth');
    console.log('memberNick ->', memberNick);
    return `check auth executed! ${memberNick}`;
  }

  @Roles(MemberType.USER, MemberType.AGENT)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRoles(@AuthMember() member: Member): Promise<string> {
    console.log('Query: checkAuthRoles');
    return `checkAuthRoles executed! ${member.memberNick}, you are ${member.memberType} and your ID is $${member._id}`;
  }

  //! ---- GET_MEMBER -----
  @Query(() => String)
  public async getMember(): Promise<string> {
    console.log('Mutation: getMember');
    return this.memberService.getMember();
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
