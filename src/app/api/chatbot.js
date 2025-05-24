import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Clave secreta del servidor
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { productName } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'El nombre del producto es requerido.' });
  }

  try {
    const { data, error } = await supabase
      .from('productos') // Cambia "productos" al nombre real de tu tabla
        .select('nombre, stock') // Cambia "nombre" y "stock" por los nombres reales de las columnas

      .ilike('nombre', `%${productName}%`); // Búsqueda flexible

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: `No se encontró el producto "${productName}".` });
    }

    res.status(200).json({ stock: data[0].stock });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
