"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
// import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

type Metric = {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: number | string;
  badgeColor: "success" | "error" | "warning" | "info";
  badgeIcon: React.ReactNode;
  badgePercentage: number;
};

type EcommerceMetricsProps = {
  className?: string;
  metrics?: Metric[];  // ahora opcional
};

export const EcommerceMetrics: React.FC<EcommerceMetricsProps> = ({
  className = "",
  metrics = [],  // valor por defecto para evitar undefined
}) => {
  if (metrics.length === 0) {
    return <div className={`text-center p-4 ${className}`}>No hay datos para mostrar</div>;
  }

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 ${className}`}>
      {metrics.map(({ id, icon, label, value, badgeColor, badgeIcon, badgePercentage }) => (
        <div
          key={id}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {value}
              </h4>
            </div>
            <Badge color={badgeColor}>
              {badgeIcon}
              {badgePercentage.toFixed(2)}%
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};
