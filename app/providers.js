'use client';

import { App, ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export default function Providers({ children }) {
  return (
    <AntdRegistry>
      <ConfigProvider>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
