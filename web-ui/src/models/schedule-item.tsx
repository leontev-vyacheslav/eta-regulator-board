import { Entity } from './entity';

export interface ScheduleItemModel extends Entity {
  periodBegin: Date,
  periodEnd: Date
  scheduleTypeId: 2
}
