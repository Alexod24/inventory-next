"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Bienes } from "./schema"; // Asegúrate de que tu interfaz Bienes está correctamente definida aquí
import { DataTableColumnHeader } from "./data-table-column-header";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<Bienes>[] = [
  {
    accessorKey: "codigo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Codigo" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("codigo")}
        </span>
      </div>
    ),
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("nombre")}
        </span>
      </div>
    ),
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },
  {
    accessorKey: "categoria", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => {
      const categoriaRaw = row.original.categoria;
      const categoriaNombre =
        typeof categoriaRaw === "object"
          ? categoriaRaw?.nombre ?? "Sin categoría"
          : typeof categoriaRaw === "string"
          ? categoriaRaw
          : "Sin categoría";

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {categoriaNombre}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "proveedor", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proveedor" />
    ),
    cell: ({ row }) => {
      // Acceso directo a la propiedad 'proveedorNombre' como string
      const proveedorNombre = row.original.proveedor?.nombre || "Sin proveedor";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {proveedorNombre}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "espacio", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Espacio" />
    ),
    cell: ({ row }) => {
      // Acceso directo a la propiedad 'espacioNombre' como string
      const espacioNombre = row.original.espacio?.nombre || "Sin espacio";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {espacioNombre}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "cantidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const cantidad = row.getValue("cantidad") as number;
      const isPositive = cantidad > 0;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize",
              isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {cantidad}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  // {
  //   accessorKey: "fecha_adquisicion",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Fecha Adquisicion" />
  //   ),
  //   cell: ({ row }) => {
  //     const rawValue = row.original.fecha_adquisicion;

  //     if (!rawValue) {
  //       console.log(
  //         "❌ Fecha de adquisición indefinida para fila:",
  //         row.original
  //       );
  //       return (
  //         <div className="flex w-[100px] items-center">
  //           <span className="capitalize">N/A</span>
  //         </div>
  //       );
  //     }

  //     const cleaned = rawValue.split(".")[0] + "Z";
  //     const date = new Date(cleaned);

  //     if (isNaN(date.getTime())) {
  //       console.log("❌ Fecha de adquisición inválida:", rawValue);
  //       return <span>Invalid Date</span>;
  //     }

  //     const formattedDate = date.toLocaleDateString("es-ES", {
  //       day: "2-digit",
  //       month: "short",
  //       year: "numeric",
  //     });

  //     return (
  //       <div className="flex w-[100px] items-center">
  //         <span className="capitalize">{formattedDate}</span>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, filterValue) => {
  //     const rawValue = row.original.fecha_adquisicion;
  //     if (!rawValue || !filterValue || filterValue.length !== 2) return true;

  //     const date = new Date(rawValue.split(".")[0] + "Z");
  //     const [startDate, endDate] = filterValue as [Date, Date];
  //     return date >= startDate && date <= endDate;
  //   },
  // },

  // ---------------------------------------------------------------------------------
  {
    accessorKey: "valor",
    // Te sugiero cambiar el "title" de "Valor" a "Precio Compra"
    // para que coincida con tu formulario, pero lo dejo como "Valor" por ahora.
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor" />
    ),
    cell: ({ row }) => {
      // 1. Obtener el valor
      const valor = row.getValue("valor") as number;

      // 2. Formatearlo como moneda (Soles Peruanos)
      const formattedPrice = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(valor);

      const isPositive = valor > 0;

      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              isPositive ? "text-green-600" : "text-gray-500", // Verde si es > 0
              "font-medium"
            )}
          >
            {formattedPrice}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      // 3. Actualizamos el filterFn para que funcione con números
      const valor = row.getValue(id) as number;
      // Permite buscar por el número (ej: "20")
      return String(valor).includes(String(value));
    },
  },

  {
    accessorKey: "precio_venta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio Venta" />
    ),
    cell: ({ row }) => {
      // 1. Obtener el valor
      const precio = row.getValue("precio_venta") as number;

      // 2. Formatearlo como moneda (ej. Soles Peruanos (PEN))
      // ¡Puedes cambiar 'es-PE' y 'PEN' si usas otra moneda!
      const formattedPrice = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(precio);

      const isPositive = precio > 0;

      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              isPositive ? "text-green-600" : "text-gray-500", // Verde si es > 0
              "font-medium"
            )}
          >
            {formattedPrice}
          </span>
        </div>
      );
    },
    // 3. Añadimos un filterFn básico para que se pueda buscar
    filterFn: (row, id, value) => {
      const precio = row.getValue(id) as number;
      // Permite buscar por el número (ej: "35")
      return String(precio).includes(String(value));
    },
  },
  // {
  //   accessorKey: "estado",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Estado Fisico" />
  //   ),
  //   cell: ({ row }) => {
  //     const estado = row.getValue("estado") as string;
  //     const isBueno = estado.toLowerCase() === "bueno";
  //     const isDañado = estado.toLowerCase() === "dañado";
  //     const isRoto = estado.toLowerCase() === "roto";

  //     return (
  //       <div className="flex w-[100px] items-center">
  //         <span
  //           className={cn(
  //             "capitalize font-semibold",
  //             isBueno ? "text-green-600" : "",
  //             isDañado ? "text-yellow-500" : "",
  //             isRoto ? "text-red-500" : ""
  //           )}
  //         >
  //           {estado}
  //         </span>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
  // {
  //   accessorKey: "disponibilidad",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Disponibilidad" />
  //   ),
  //   cell: ({ row }) => {
  //     let disponibilidadRaw = row.getValue("disponibilidad");

  //     // Ajuste para manejar booleanos como en el esquema Zod
  //     let disponibilidad =
  //       typeof disponibilidadRaw === "boolean"
  //         ? disponibilidadRaw === true
  //           ? "ok"
  //           : "faltante"
  //         : typeof disponibilidadRaw === "string"
  //         ? disponibilidadRaw
  //         : "pendiente"; // o valor por defecto si es null/undefined

  //     disponibilidad = disponibilidad.toLowerCase();

  //     return (
  //       <div className="flex w-[100px] items-center">
  //         <span
  //           className={cn(
  //             "capitalize font-semibold",
  //             disponibilidad === "ok" && "text-green-600",
  //             disponibilidad === "faltante" && "text-red-500",
  //             disponibilidad === "pendiente" && "text-yellow-500"
  //           )}
  //         >
  //           {disponibilidad}
  //         </span>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
  {
    accessorKey: "observaciones",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripcion" />
    ),
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <span className="max-w-[500px] truncate capitalize font-medium">
          {row.getValue("observaciones")}
        </span>
      </div>
    ),
    filterFn: (row, id, filterValue) => {
      const value = row.getValue(id) as string;
      return value
        .toLowerCase()
        .includes((filterValue as string).toLowerCase());
    },
  },

  {
    accessorKey: "usuario", // AccesorKey coincide con schema.ts
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responsable" />
    ),
    cell: ({ row }) => {
      // Acceso directo a la propiedad 'usuario' como string
      const usuarioRaw = row.original.usuario;
      const usuarioNombre =
        typeof usuarioRaw === "object"
          ? usuarioRaw?.nombre ?? "Sin usuario"
          : typeof usuarioRaw === "string"
          ? usuarioRaw
          : "Sin usuario";
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {usuarioNombre}
          </span>
        </div>
      );
    },
  },

  // ---------------------------------------------------------------------------------
  {
    accessorKey: "creado_en",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha creación" />
    ),
    cell: ({ row }) => {
      const rawValue = row.original.creado_en;
      if (!rawValue) return <span>N/A</span>;

      const date = new Date(rawValue.split(".")[0] + "Z");
      if (isNaN(date.getTime())) return <span>Invalid Date</span>;

      const formattedDate = date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return <span className="capitalize">{formattedDate}</span>;
    },
  },
  // {
  //   accessorKey: "actualizado_en",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Fecha actualización" />
  //   ),
  //   cell: ({ row }) => {
  //     const rawValue = row.original.actualizado_en;
  //     if (!rawValue) return <span>N/A</span>;

  //     const date = new Date(rawValue.split(".")[0] + "Z");
  //     if (isNaN(date.getTime())) return <span>Invalid Date</span>;

  //     const formattedDate = date.toLocaleDateString("es-ES", {
  //       day: "2-digit",
  //       month: "short",
  //       year: "numeric",
  //     });
  //     const formattedTime = date.toLocaleTimeString("es-ES", {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       second: "2-digit",
  //     });

  //     return (
  //       <span className="capitalize">
  //         {formattedDate} {formattedTime}
  //       </span>
  //     );
  //   },
  // },
];
