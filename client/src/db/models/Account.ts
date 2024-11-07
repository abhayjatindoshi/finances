import { Model } from "@nozbe/watermelondb";
import TableName from "../TableName";
import { date, field, text } from "@nozbe/watermelondb/decorators";

export default class Account extends Model {
  static table = TableName.Accounts

  @text('name') name!: string;
  @field('initial_balance') initialBalance!: number;
  @date('created_at') createdAt!: Date;
  @date('modified_at') modifiedAt!: Date;
}