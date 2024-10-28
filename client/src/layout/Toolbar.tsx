import { Button } from 'antd'
import React from 'react'

export default function Toolbar() {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="justify-self-start">
        <a className="flex flex-row items-center gap-2" href="/">
          <img src="/logo.png" alt="logo" height="40px" />
          <span className='text-xl'>Finances</span>
        </a>
      </div>
      <div className="justify-self-end">
        <Button>Test</Button>
      </div>
    </div>
  )
}
