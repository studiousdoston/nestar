import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

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
  //* Authenticated users only
  @Mutation(() => String)
  public async updateMember(): Promise<string> {
    console.log('Mutation: updateMember');
    return this.memberService.updateMember();
  }

  //! ---- GET_MEMBER -----
  @Query(() => String)
  public async getMember(): Promise<string> {
    console.log('Mutation: getMember');
    return this.memberService.getMember();
  }

  //*     ADMIN

  //* Authorization: ADMIN
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
