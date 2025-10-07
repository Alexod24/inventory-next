"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext"; // Asegúrate de que la ruta sea correcta
import { useUser } from "@/context/UserContext"; // <--- IMPORTANTE: Nueva importación

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots, // Asegúrate de que esta importación es correcta
  PieChartIcon,
  TaskIcon,
  ListIcon,
  PageIcon,
  UserCircleIcon,
  TableIcon,
  DocsIcon,
} from "../icons/index"; // Asegúrate de que esta ruta sea correcta
// import SidebarWidget from "./SidebarWidget"; // Si lo usas, asegúrate de que sea un Client Component

// Define la interfaz para tus elementos de navegación, incluyendo la propiedad 'roles'
interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    roles?: string[];
  }[]; // Añade roles a subItems también
  roles?: string[]; // <--- NUEVA PROPIEDAD: Array de roles permitidos
}

// Define tus elementos de navegación con roles.
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/base",
    roles: ["admin", "empleado"], // Todos los roles autenticados
  },
  {
    icon: <TaskIcon />,
    name: "Bienes",
    path: "/bienes",
    roles: ["admin", "empleado"], // Admin y Empleado
  },
  {
    icon: <PageIcon />,
    name: "Movimientos",
    path: "/movimientos",
    roles: ["admin", "empleado"], // Admin y Empleado
  },
  {
    icon: <PieChartIcon />,
    name: "Reportes",
    path: "/reportes",
    roles: ["admin", "empleado"], // Solo Admin
  },
  {
    icon: <DocsIcon />,
    name: "Documentos",
    path: "/documentos",
    roles: ["admin", "empleado"], // Todos los roles autenticados
  },
  // {
  //   name: "Espacios",
  //   icon: <ListIcon />,
  //   // Si el menú padre agrupa items, el padre también debe tener roles si sus hijos los tienen.
  //   // Si es un menú "general" que contiene sub-ítems con roles específicos, puedes dejarlo amplio.
  //   roles: ["admin", "empleado", "usuario"],
  //   subItems: [
  //     {
  //       name: "Phone Booth",
  //       path: "/espacios/phone-booth",
  //       roles: ["admin", "empleado", "usuario"],
  //     },
  //     {
  //       name: "El Hangar",
  //       path: "/espacios/el-hangar",
  //       roles: ["admin", "empleado", "usuario"],
  //     },
  //     {
  //       name: "Bunkers",
  //       path: "/espacios/bunkers",
  //       roles: ["admin", "empleado", "usuario"],
  //     },
  //     {
  //       name: "Unidades",
  //       path: "/espacios/unidades",
  //       roles: ["admin", "empleado", "usuario"],
  //     },
  //     {
  //       name: "La Brigada",
  //       path: "/espacios/la-brigada",
  //       roles: ["admin", "empleado", "usuario"],
  //     },
  //     {
  //       name: "Counter",
  //       path: "/espacios/counter",
  //       roles: ["admin", "empleado", "usuario"],
  //     },
  //     {
  //       name: "Limpieza",
  //       path: "/espacios/limpieza",
  //       roles: ["admin", "empleado", "usuario"],
  //     },
  //     {
  //       name: "Almacen",
  //       path: "/espacios/almacen",
  //       roles: ["admin", "empleado", "usuario"],
  //     },
  //   ],
  // },
];

const othersItems: NavItem[] = [
  {
    icon: <CalenderIcon />,
    name: "Calendario",
    path: "/base",
    roles: ["admin", "empleado"], // Todos los roles autenticados
  },
  {
    icon: <UserCircleIcon />,
    name: "Usuarios",
    path: "/usuarios",
    roles: ["admin"], // <--- SOLO ADMIN PUEDE VER ESTE MÓDULO
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user, loading } = useUser(); // <--- OBTÉN EL USUARIO Y EL ESTADO DE CARGA

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Función para renderizar los elementos del menú
  const renderMenuItems = (
    navItemsToRender: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItemsToRender.map((nav, index) => {
        // Lógica de visibilidad basada en el rol
        // Un elemento es visible si:
        // 1. El usuario ya cargó (no está en estado 'loading')
        // 2. El elemento de navegación NO tiene la propiedad 'roles' definida (es visible para todos por defecto)
        // 3. O, si tiene 'roles' definidos, el usuario está autenticado, tiene un rol, Y su rol está incluido en los 'roles' permitidos.
        // 4. O, si el usuario está autenticado pero NO tiene un rol definido en la BD, y el elemento permite 'usuario_sin_rol'.
        const isVisible =
          !loading && // Asegúrate de que el usuario ya cargó
          (nav.roles === undefined || // Si no tiene roles definidos, es visible por defecto
            (user && user.rol && nav.roles.includes(user.rol)) || // Si el usuario tiene un rol y está permitido
            (user && !user.rol && nav.roles.includes("usuario_sin_rol"))); // Si el usuario está autenticado pero sin rol en la tabla 'usuarios'

        if (!isVisible) {
          return null; // No renderiza el elemento si el usuario no tiene permiso
        }

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={` ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => {
                    // Lógica de visibilidad para sub-ítems (similar a los ítems principales)
                    const isSubItemVisible =
                      !loading &&
                      (subItem.roles === undefined ||
                        (user &&
                          user.rol &&
                          subItem.roles.includes(user.rol)) ||
                        (user &&
                          !user.rol &&
                          subItem.roles.includes("usuario_sin_rol")));

                    if (!isSubItemVisible) {
                      return null;
                    }

                    return (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path || "#"} // Asegúrate de que subItem.path exista
                          className={`menu-dropdown-item ${
                            isActive(subItem.path || "") // Asegúrate de que subItem.path exista
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path || "")
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path || "")
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  useEffect(() => {
    let submenuMatched = false;
    // Combina ambos arrays para la búsqueda, asegurando el orden correcto si es relevante
    const allNavItems = [...navItems, ...othersItems];

    allNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (subItem.path && isActive(subItem.path)) {
            // Asegúrate de que subItem.path exista
            // Encuentra el índice del elemento padre en su array original (navItems o othersItems)
            const parentIndexInMain = navItems.indexOf(nav);
            const parentIndexInOthers = othersItems.indexOf(nav);

            if (parentIndexInMain !== -1) {
              setOpenSubmenu({ type: "main", index: parentIndexInMain });
            } else if (parentIndexInOthers !== -1) {
              setOpenSubmenu({ type: "others", index: parentIndexInOthers });
            }
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
    // Añade navItems y othersItems a las dependencias si sus contenidos pueden cambiar
  }, [pathname, isActive, navItems, othersItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Muestra un estado de carga o un menú vacío mientras se carga el usuario
  if (loading) {
    return (
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${!isExpanded && !isHovered ? "w-[90px]" : "w-[290px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <div className="py-8 flex justify-center items-center h-full">
          <span className="text-gray-500 dark:text-gray-400">
            Cargando menú...
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/base">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/labase.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/labase.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icono.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Otros"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
