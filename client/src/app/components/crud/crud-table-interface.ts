// Interfaz para las props del componente CrudTable

export interface CrudTableColumn<T = any> {
  key: string; // clave del campo en el objeto de datos
  label: string; // etiqueta a mostrar en la cabecera
  sortable?: boolean; // si la columna es ordenable
  slot?: boolean; // si la columna usa slot personalizado
  render?: (row: T) => string | JSX.Element; // función para renderizar el contenido de la celda
}

export type ActionType = 'View' | 'Update' | 'Delete' | 'Custom';

export interface CrudTableActionType<T = any> {
  type: ActionType;
  routeName?: string;
  /**
   * Params dinámicos del router para la acción (ej. { productId: item.id }).
   * Si no se define, CrudTable usará por defecto { id: item.id }.
   */
  params?: (item: T) => Record<string, any>;
}

export interface CrudTableEntity<T = any> {
  deleteMessage?: string; // Mensaje de confirmación para eliminar

  /**
   * Permite definir cómo se construye el texto/identificador del ítem que se muestra
   * dentro del mensaje de confirmación al eliminar.
   *
   * Si no se define, el componente puede hacer fallback a `item.id`.
   *
   * Ejemplos:
   *  - (item) => `${item.code} - ${item.name}`
   *  - (item) => item.name
   */
  deleteItemLabel?: (item: T) => string;

  notFound: string;
  columns: CrudTableColumn<T>[];
  actions?: CrudTableActionType<T>[]; // Acciones permitidas para la entidad
  // Puedes agregar más propiedades si tu entidad lo requiere
}

export interface CrudTableService<T = any> {
  retrieve(paginationQuery?: any): Promise<any>;
  find(id: number | string): Promise<T>;
  create(entity: T): Promise<T>;
  createMany?(entities: T[]): Promise<T[]>;
  update(entity: T): Promise<T>;
  partialUpdate(entity: T): Promise<T>;
  delete(id: number | string): Promise<void>;
  // Puedes agregar create, update, etc. si lo necesitas
}
