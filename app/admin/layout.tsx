import React from 'react';
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell';

export const metadata = {
  title: 'YIMI CMS — Panel Admin Pengelola',
  description: 'Panel Pengelolaan Konten Website Yayasan Insan Muslim Istiqomah',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
