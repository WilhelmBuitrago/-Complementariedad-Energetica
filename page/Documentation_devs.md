# Documentación para Desarrolladores

## Resumen del Proyecto
Este proyecto es una aplicación de mapa interactivo construida utilizando Leaflet.js, SQL.js y D3.js. Permite a los usuarios visualizar correlaciones entre ubicaciones basadas en datos de una base de datos y archivos CSV. La aplicación incluye deslizadores para filtrar datos y un menú desplegable para seleccionar años.

## Estructura de Archivos
- **index.html**: Archivo HTML principal que contiene la estructura de la aplicación.
- **css/styles.css**: Hoja de estilos para la aplicación.
- **js/scripts.js**: Archivo JavaScript principal que maneja la lógica de la aplicación.
- **js/worker.js**: Web Worker para procesar datos CSV de forma asíncrona.
- **assets/**: Contiene archivos de base de datos, archivos CSV y datos GeoJSON.

## Características Clave
1. **Mapa Interactivo**: Muestra ubicaciones con marcadores y permite la interacción.
2. **Filtrado de Datos**: Deslizadores y menús desplegables para filtrar datos basados en valores de correlación y años.
3. **Web Worker**: Procesa datos CSV en segundo plano para mejorar el rendimiento.
4. **Tabla Dinámica**: Muestra los datos filtrados en formato de tabla.

## Instrucciones de Configuración
1. Clona el repositorio.
2. Asegúrate de tener un servidor local para servir los archivos (por ejemplo, usando VS Code Live Server).
3. Coloca los recursos necesarios (base de datos, CSV, GeoJSON) en la carpeta `assets/`.
4. Abre `index.html` en un navegador.

## Dependencias
- Leaflet.js
- SQL.js
- D3.js
- PapaParse
- Leaflet Extra Markers

## Explicación del Código
### worker.js
- Obtiene y analiza archivos CSV utilizando PapaParse.
- Filtra datos basados en los valores de los deslizadores y envía los datos procesados de vuelta al hilo principal.

### scripts.js
- Inicializa el mapa y renderiza los marcadores.
- Maneja las interacciones de los deslizadores y el menú desplegable.
- Se comunica con el Web Worker para el procesamiento de datos.
- Actualiza el mapa y la tabla basándose en los datos filtrados.

### styles.css
- Define el diseño y los estilos para la aplicación, incluyendo el mapa, los deslizadores y la tabla.

## Directrices para Contribuir
1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad o corrección de errores.
3. Realiza commits de tus cambios con mensajes claros.
4. Envía un pull request para revisión.

## Contacto
Para cualquier pregunta o problema, por favor contacta al mantenedor del proyecto.