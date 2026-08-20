import 'antd/dist/reset.css';
import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Alerts Configuration',
  description: 'A Next.js and Ant Design demo for alert monitoring and league-level alert bypass configuration.',
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
