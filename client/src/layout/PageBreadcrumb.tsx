import { Breadcrumb } from 'antd';
import React, { FC, ReactNode } from 'react'

interface InputProps {
  items: ReactNode[]
}

const PageBreadcrumb: FC<InputProps> = ({ items }) => {
  return <Breadcrumb
    className='p-2 text-sm'
    style={{ backgroundColor: 'var(--ant-color-fill)' }}
    items={items.map(i => { return { title: i } })}
  />
}

export default PageBreadcrumb;