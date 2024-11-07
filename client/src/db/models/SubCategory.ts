import { Model, Relation } from "@nozbe/watermelondb"
import { Associations } from "@nozbe/watermelondb/Model";
import { date, relation, text } from "@nozbe/watermelondb/decorators";
import Category from "./Category";
import TableName from "../TableName";

export default class SubCategory extends Model {
  static table = TableName.SubCategories
  static associations: Associations = {
    [TableName.Categories]: { type: 'belongs_to', key: 'category_id' },
  }

  @text('name') name!: string
  @relation(TableName.Categories, 'category_id') category!: Relation<Category>
  @date('created_at') createdAt!: Date;
  @date('modified_at') modifiedAt!: Date;
}