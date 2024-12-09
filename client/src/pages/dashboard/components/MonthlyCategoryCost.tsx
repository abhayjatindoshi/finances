import { Collapse, CollapseProps, List, Select, Typography } from 'antd';
import { Database } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import Category from '../../../db/models/Category';
import Money from '../../../common/Money';
import React from 'react';
import SubCategory from '../../../db/models/SubCategory';
import TableName from '../../../db/TableName';
import Tranasction from '../../../db/models/Transaction';

interface MonthlyCategoryCostProps {
  transactions: Array<Tranasction>;
  subCategories: Array<SubCategory>;
  categories: Array<Category>;
}

const MonthlyCategoryCost: React.FC<MonthlyCategoryCostProps> = ({ transactions, subCategories, categories }) => {

  const [selectedMonth, setSelectedMonth] = React.useState((new Date().getMonth() + 11) % 12);

  const categoryMap = categories.reduce((map, category) => {
    map.set(category.id, category);
    return map;
  }, new Map<string, Category>());

  const subCategoryMap = subCategories.reduce((map, subCategory) => {
    map.set(subCategory.id, subCategory);
    return map;
  }, new Map<string, SubCategory>());

  const costPerSubCategory = transactions.filter(t => t.transactionAt.getMonth() === selectedMonth).reduce((map, transaction) => {
    if (!transaction.subCategory?.id) return map;
    const amount = map.get(transaction.subCategory.id) || 0;
    map.set(transaction.subCategory.id, amount + transaction.amount);
    return map;
  }, new Map<string, number>());

  const costPerCategory = Array.from(costPerSubCategory.entries()).reduce((map, [subCategoryId, cost]) => {
    const subCategory = subCategoryMap.get(subCategoryId);
    if (!subCategory) return map;

    const categoryId = subCategory.category.id;
    const amount = map.get(categoryId) || 0;
    map.set(categoryId, amount + cost);
    return map;
  }, new Map<string, number>());

  const accordionData: CollapseProps['items'] = Array.from(costPerCategory.entries())
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([categoryId, cost]) => {
      const category = categoryMap.get(categoryId);

      const subCategoryVsCost = Array.from(costPerSubCategory.entries())
        .filter(([subCategoryId, _]) => subCategoryMap.get(subCategoryId)?.category.id === categoryId)
        .map(([subCategoryId, cost]) => ({
          name: subCategoryMap.get(subCategoryId)?.name,
          cost
        }))
        .sort((a, b) => Math.abs(b.cost) - Math.abs(a.cost));

      return {
        key: categoryId,
        label: <div className='flex place-content-between w-full'>
          <Typography.Text>{category?.name}</Typography.Text>
          <Money amount={Math.abs(cost)} />
        </div>,
        children: <List size='small' dataSource={subCategoryVsCost} renderItem={({ name, cost }) => (
          <List.Item>
            <div className='flex flex-row items-center w-full'>
              <Typography.Text className='grow text-lg' ellipsis={true}>{name}</Typography.Text>
              <div className='text-sm text-nowrap'><Money amount={Math.abs(cost)} /></div>
            </div>
          </List.Item>
        )} />
      }
    });

  return (
    <div className='rounded-lg p-2 w-96' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      <Select className='w-48 mb-2' value={selectedMonth} onChange={setSelectedMonth}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Select.Option key={index + 1} value={index}>{new Date(0, index).toLocaleString('default', { month: 'long' })}</Select.Option>
        ))}
      </Select>
      <Collapse className='overflow-auto h-64' accordion items={accordionData} />
    </div>
  );
};
const enhance = withObservables([], ({ database }: { database: Database }) => ({
  transactions: database.collections.get<Tranasction>(TableName.Transactions).query(),
  subCategories: database.collections.get<SubCategory>(TableName.SubCategories).query(),
  categories: database.collections.get<Category>(TableName.Categories).query(),
}));
const EnhancedMonthlyCategoryCost = withDatabase(enhance(MonthlyCategoryCost));
export default EnhancedMonthlyCategoryCost;