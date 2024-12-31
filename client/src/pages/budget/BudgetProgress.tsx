import { Progress, Tooltip } from "antd";
import Money from "../../common/Money";
import { CategoryData } from "./BudgetCategories";

interface BudgetProgressProps {
  data: CategoryData
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ data }) => {

  const additionalPercentage = data.budgetPercentage > 100 ? data.budgetPercentage - 100 : 0;
  let additionalColorIndex = 10 - (parseInt((additionalPercentage / 100).toFixed(0)) + 2);
  additionalColorIndex = additionalColorIndex < 3 ? 3 : additionalColorIndex > 8 ? 8 : additionalColorIndex;

  return (
    <Tooltip title={<>
      {data.budgetPercentage.toFixed(0)}% <br />
      <Money amount={-data.total} /> / <Money amount={data.yearlyLimit} />
    </>}>
      <div className="flex flex-col">
        <div className="py-5 px-2">
          <Progress percent={parseInt(data.budgetPercentage.toFixed(0))}
            success={{ percent: additionalPercentage, strokeColor: `var(--ant-red-${additionalColorIndex})` }}
            status="active" size={['100%', 20]}
            percentPosition={{ align: "center", type: "inner" }}
            showInfo={data.budgetPercentage < 100} />
        </div>
        {data.budgetPercentage >= 100 &&
          <div className="text-lg" style={{ marginTop: '-3.125rem', zIndex: 1 }}>
            {data.budgetPercentage.toFixed(0)}%
          </div>}
      </div>
    </Tooltip>
  );
};

export default BudgetProgress;