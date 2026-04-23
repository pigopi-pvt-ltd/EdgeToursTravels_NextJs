
import DriverLayout from '@/components/DriverLayout';

// This layout wraps all pages under /driver-dashboard with the DriverLayout

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DriverLayout>{children}</DriverLayout>;
}