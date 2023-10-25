
import { Entity } from './entity';

export interface UserModel extends Entity {
  roleId: number;

  organizationId: number | null;

  email: string;

  password: string;

  isActive: boolean;

  createUserId: number;

  updateUserId: number;

  createDate: Date;

  updateDate: Date;
}
