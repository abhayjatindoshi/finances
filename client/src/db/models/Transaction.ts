import { associations, Associations } from "@nozbe/watermelondb/Model";
import { Model, Relation } from "@nozbe/watermelondb";
import { relation, date, field, text } from "@nozbe/watermelondb/decorators";
import Account from "./Account";
import SubCategory from "./SubCategory";
import TableName from "../TableName";

export default class Tranasction extends Model {
  static table = 'transactions'
  static associations: Associations = associations(
    [TableName.Accounts, { type: 'belongs_to', key: 'account_id' }],
    [TableName.Accounts, { type: 'belongs_to', key: 'transfer_account_id' }],
    [TableName.SubCategories, { type: 'belongs_to', key: 'sub_category_id' }],
  )

  @relation(TableName.Accounts, 'account_id') account!: Relation<Account>
  @relation(TableName.Accounts, 'transfer_account_id') transferAccount?: Relation<Account>
  @relation(TableName.SubCategories, 'sub_category_id') subCategory?: Relation<SubCategory>
  @date('transaction_at') transactionAt!: Date
  @text('title') title!: string
  @text('summary') summary!: string
  @field('amount') amount!: number
  @date('created_at') createdAt!: Date;
  @date('modified_at') modifiedAt!: Date;
}