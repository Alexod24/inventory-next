// import { createSupabaseClient } from './client';

// // Leer datos
// export const getProductos = async () => {
//   const { data, error } = await createSupabaseClient.from('productos').select('*');
//   if (error) {
//     console.error('Error al obtener productos:', error);
//     throw error;
//   }
//   return data;
// };

// // Crear un nuevo producto
// export const addProducto = async (producto: {
//   nombre: string;
//   descripcion: string;
//   precio: number;
//   stock: number;
// }) => {
//   const { data, error } = await createSupabaseClient.from('productos').insert([producto]);
//   if (error) {
//     console.error('Error al agregar producto:', error);
//     throw error;
//   }
//   return data;
// };

// // Actualizar un producto
// export const updateProducto = async (
//   id: string,
//   updates: { nombre?: string; descripcion?: string; precio?: number; stock?: number },
// ) => {
//   const { data, error } = await createSupabaseClient.from('productos').update(updates).eq('id', id);
//   if (error) {
//     console.error('Error al actualizar producto:', error);
//     throw error;
//   }
//   return data;
// };

// // Eliminar un producto
// export const deleteProducto = async (id: string) => {
//   const { data, error } = await createSupabaseClient.from('productos').delete().eq('id', id);
//   if (error) {
//     console.error('Error al eliminar producto:', error);
//     throw error;
//   }
//   return data;
// };
