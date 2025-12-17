"use client";

import React, { useMemo } from "react";
import { DataTable } from "@/components/common/data-table/data-table";
import { getColumns } from "@/components/tabla/productos/columns";

interface BaseClientProps {
  data: any[];
}

export default function BaseClient({ data }: BaseClientProps) {
  // UseMemo to avoid recreating columns on every render
  // We pass a no-op function for refreshData since this is likely a read-only view or doesn't manage state this way
  const columns = useMemo(() => getColumns(async () => {}), []);

  return <DataTable data={data} columns={columns} loading={false} />;
}
