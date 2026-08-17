import { registerEnumType } from '@nestjs/graphql';

export enum MemberType {
  USER = 'USER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  BLOCK = 'BLOCK',
  DELETE = 'DELETE',
}

export enum MemberAuthType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  TELEGRAM = 'TELEGRAM',
}

registerEnumType(MemberType, {
  name: 'MemberType',
});

registerEnumType(MemberAuthType, {
  name: 'MemberAuthType',
});
