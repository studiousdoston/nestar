import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { JwtService } from '@nestjs/jwt';
import { T } from '../../libs/types/common';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  //* HASH PASSWORD
  public async hashPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, salt);
  }

  //* COMPARE PASSWORD
  public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  //* CREATE TOKEN
  public async createToken(member: Member): Promise<string> {
    const payload: T = {};
    const source = member['_doc'] ? member['_doc'] : member;
    Object.keys(source).forEach((ele) => {
      payload[ele] = source[ele];
    });
    delete payload.memberPassword;
    console.log('payload ->', payload);
    return await this.jwtService.signAsync(payload);
  }

  //* VERIFY TOKEN
  public async verifyToken(token: string): Promise<Member> {
    const member = await this.jwtService.verifyAsync(token);
    return member;
  }
}
