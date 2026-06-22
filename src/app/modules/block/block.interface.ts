import { Document, Types } from "mongoose";

export interface IBlockInitial {
  blockerId: Types.ObjectId;
  blockedId: Types.ObjectId;
}

export type IBlock = IBlockInitial & Document;
