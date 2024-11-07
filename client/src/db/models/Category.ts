import { Model } from "@nozbe/watermelondb";
import TableName from "../TableName";
import { date, field, text } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

export default class Category extends Model {
  static table = TableName.Categories;
  static associations: Associations = {
    [TableName.SubCategories]: {
      type: "has_many", foreignKey: "category_id"
    }
  }

  @text('name') name!: string;
  @field('monthly_limit') monthlyLimit!: number
  @field('yearly_limit') yearlyLimit!: number
  @text('type') type!: CategoryType
  @date('created_at') createdAt!: Date;
  @date('modified_at') modifiedAt!: Date;
}

export enum CategoryType {
  Needs = 'Needs',
  Wants = 'Wants',
  Savings = 'Savings',
  Income = 'Income'
}