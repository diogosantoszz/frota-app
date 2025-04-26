import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function AdminLayout({ children }) {
  return (
    <ResponsiveLayout>
      {children}
    </ResponsiveLayout>
  );
}