import { withObservables } from '@nozbe/watermelondb/react';
import { Collapse, CollapseProps, DatePicker, List, Typography } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import React from 'react';
import { useParams } from 'react-router-dom';
import Money from '../../../common/Money';
import database from '../../../db/database';
import Category from '../../../db/models/Category';
import SubCategory from '../../../db/models/SubCategory';
import Tranasction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';

interface MonthlyCategoryCostProps {
  transactions: Array<Tranasction>;
  subCategories: Array<SubCategory>;
  categories: Array<Category>;
}

const MonthlyCategoryCost: React.FC<MonthlyCategoryCostProps> = ({ transactions, subCategories, categories }) => {

  const findStartDate = (): Date => {
    const firstTransaction = transactions.sort((a, b) => a.transactionAt.getTime() - b.transactionAt.getTime())[0];
    if (firstTransaction) {
      return new Date(firstTransaction.transactionAt.getFullYear(), firstTransaction.transactionAt.getMonth(), 1);
    }
    return new Date();
  }

  const findEndDate = (): Date => {
    const lastTransaction = transactions.sort((a, b) => b.transactionAt.getTime() - a.transactionAt.getTime())[0];
    if (lastTransaction) {
      return new Date(lastTransaction.transactionAt.getFullYear(), lastTransaction.transactionAt.getMonth() + 1, 0);
    }
    return new Date();
  }

  const { RangePicker } = DatePicker;
  const [startDate, setStartDate] = React.useState(findStartDate());
  const [endDate, setEndDate] = React.useState(findEndDate());

  const categoryMap = categories.reduce((map, category) => {
    map.set(category.id, category);
    return map;
  }, new Map<string, Category>());

  const subCategoryMap = subCategories.reduce((map, subCategory) => {
    map.set(subCategory.id, subCategory);
    return map;
  }, new Map<string, SubCategory>());

  const costPerSubCategory = transactions
    .filter(t => startDate.getTime() <= t.transactionAt.getTime() && t.transactionAt.getTime() <= endDate.getTime())
    .reduce((map, transaction) => {
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
      <RangePicker className='mb-2'
        format="DD MMM YYYY"
        value={[dayjs(startDate), dayjs(endDate)]}
        onChange={(_, [start, end]) => {
          if (start) setStartDate(moment(start).toDate());
          if (end) setEndDate(moment(end).toDate());
        }} />
      <Collapse className='overflow-auto h-64' accordion items={accordionData} />
    </div>
  );
};
const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  transactions: database(tenantId).collections.get<Tranasction>(TableName.Transactions).query(),
  subCategories: database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query(),
  categories: database(tenantId).collections.get<Category>(TableName.Categories).query(),
}));
const EnhancedMonthlyCategoryCost = () => {
  const { tenantId } = useParams();
  const EnhancedMonthlyCategoryCost = enhance(MonthlyCategoryCost);
  return <EnhancedMonthlyCategoryCost tenantId={tenantId} />;
};
export default EnhancedMonthlyCategoryCost;