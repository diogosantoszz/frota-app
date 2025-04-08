import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function StatCard({ icon, title, value, bgColor = "bg-blue-50" }) {
  return (
    <Card>
      <CardHeader className={bgColor}>
        <CardTitle className="flex items-center">
          {icon && React.cloneElement(icon, { className: "mr-2", size: 20 })}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-4xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
