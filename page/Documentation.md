# Documentation

## Descripción del Proyecto
Este proyecto es un mapa interactivo desarrollado con Leaflet que permite visualizar datos geoespaciales en un formato dinámico y fácil de usar. Incluye funcionalidades como selección de año, ajuste de rangos mediante sliders y visualización de datos dinámicos.

## Requisitos del Sistema
- Navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, etc.)
- Conexión a internet para cargar las librerías externas

## Estructura del Proyecto
- **index.html**: Archivo principal que contiene la estructura del mapa interactivo y los controles.
- **archivo_geojson.json**: Archivo que contiene los datos geoespaciales en formato GeoJSON.
- **css/styles.css**: Archivo de estilos para personalizar la apariencia del mapa y los controles.
- **js/scripts.js**: Archivo JavaScript que implementa la lógica del mapa y las interacciones del usuario.

## Instrucciones de Uso
1. **Abrir el Proyecto**: Abra el archivo `index.html` en su navegador web.
2. **Interacción con el Mapa**:
   - Navegue y haga zoom en el mapa para explorar diferentes áreas.
   - Los datos geoespaciales se cargan automáticamente desde el archivo `archivo_geojson.json`.
3. **Selector de Año**:
   - Use el menú desplegable para seleccionar un año específico (2017, 2018, 2019 o Typical).
4. **Ajuste de Rango**:
   - Utilice los sliders para ajustar los valores de rango dinámico.
   - Los valores seleccionados se reflejan en tiempo real en el texto dinámico.
5. **Visualización de Datos**:
   - Los datos dinámicos se muestran en el contenedor de salida (`#output`) según las interacciones del usuario.

## Librerías Utilizadas
- [Leaflet](https://leafletjs.com/): Para la visualización del mapa interactivo.
- [Leaflet Extra Markers](https://github.com/coryasilva/Leaflet.ExtraMarkers): Para personalizar los marcadores del mapa.
- [PapaParse](https://www.papaparse.com/): Para procesar archivos CSV.
- [XLSX.js](https://github.com/SheetJS/sheetjs): Para procesar archivos Excel.
- [SQL.js](https://sql.js.org/): Para manejar bases de datos SQLite en el navegador.
- [D3.js](https://d3js.org/): Para la manipulación de datos y visualizaciones.

## Personalización
- **Estilos**: Modifique el archivo `css/styles.css` para cambiar la apariencia del mapa y los controles.
- **Datos**: Actualice el archivo `archivo_geojson.json` para cargar nuevos datos geoespaciales.
- **Lógica**: Edite el archivo `js/scripts.js` para agregar nuevas funcionalidades o modificar las existentes.

## Soporte
Si tiene preguntas o necesita ayuda, por favor contacte al desarrollador del proyecto.