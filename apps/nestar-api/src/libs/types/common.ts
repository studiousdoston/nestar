import { ObjectId } from 'mongoose';

export interface StatsModifier {
  _id: ObjectId;
  targetKey: string;
  modifier: number;
}

export type T = Record<string, any>;
