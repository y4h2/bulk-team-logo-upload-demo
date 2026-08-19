import 'antd/dist/reset.css';
import '../src/styles.css';
import Providers from './providers';

export const metadata = {
  title: 'Bulk Team Logo Upload',
  description: 'A Next.js 14 and Ant Design demo for managing team logo variants.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
