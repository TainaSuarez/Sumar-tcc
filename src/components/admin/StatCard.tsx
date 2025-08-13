'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  iconColor?: string;
  bgColor?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-50'
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Si es un número grande, formatearlo con separadores de miles
      if (val >= 1000) {
        return val.toLocaleString('es-ES');
      }
      return val.toString();
    }
    return val;
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          bgColor
        )}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {formatValue(value)}
          </div>
          
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-2">
              <Badge 
                variant={trend.isPositive ? "default" : "destructive"}
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive 
                    ? "bg-green-100 text-green-700 hover:bg-green-100" 
                    : "bg-red-100 text-red-700 hover:bg-red-100"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {trend.value > 0 && '+'}
                {trend.value}%
              </Badge>
              
              <span className="text-xs text-gray-500">
                {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
