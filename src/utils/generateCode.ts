// utils/generateCode.ts
export const generateCode = (
  categoriaNombre: string,
  subcategoriaNombre: string,
  nombre: string,
  suffix: string = "001"
): string => {
  const categoriaCode = categoriaNombre.slice(0, 3).toUpperCase();
  const subcategoriaCode = subcategoriaNombre.slice(0, 3).toUpperCase();
  const nombreCode = nombre
    ? nombre
        .split(" ")
        .map((word) => word.slice(0, 3).toUpperCase())
        .join("-")
    : "";
  return `${categoriaCode}-${subcategoriaCode}-${nombreCode}-${suffix}`;
};

export const calculateNextSuffix = (existingCodes: string[]): string => {
  const suffixes = existingCodes
    .map((code) => {
      const match = code.match(/-(\d{3})$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num): num is number => num !== null);

  const nextSuffix = Math.max(0, ...suffixes) + 1;
  return nextSuffix.toString().padStart(3, "0");
};
