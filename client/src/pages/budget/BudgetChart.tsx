import { Tooltip } from "antd";
import Category from "../../db/models/Category";
import Money from "../../common/Money";

interface BudgetChartProps {
  size: string,
  category: Category,
  amount: number
}

const BudgetChart: React.FC<BudgetChartProps> = ({ size, category, amount }) => {

  const limit = category.monthlyLimit > 0 ? category.monthlyLimit : category.yearlyLimit / 12;
  const percentage = ((-amount / limit) * 100);
  const displayPercentage = percentage > 125 ? 125 : percentage < 20 && percentage > 0 ? 20 : percentage;
  const colorIndex = 10 - (Math.floor(displayPercentage / 20));
  const color = percentage > 100 ? `var(--ant-red-${colorIndex})` : `var(--ant-blue-${colorIndex})`;

  return (
    <Tooltip title={<>
      {percentage.toFixed(0)}% <br />
      <Money amount={-amount} /> / <Money amount={limit} />
    </>}>
      <div style={{ width: size, height: size }}>
        <div className="p-2 h-full w-full">
          <div className="rounded-full opacity-70 hover:opacity-100 flex items-center justify-center" style={{
            backgroundColor: color,
            height: displayPercentage + '%',
            width: displayPercentage + '%'
          }}>
            {percentage > 100 && percentage.toFixed(0) + '%'}
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default BudgetChart;