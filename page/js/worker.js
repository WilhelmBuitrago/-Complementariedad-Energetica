// Importa la librería PapaParse si no la tienes incluida en el entorno global del Worker
importScripts('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js');

self.onmessage = async function(e) {
  // Recibe los parámetros necesarios
  const { year, clickedName, sliderValue1, sliderValue2, df_lon_lat } = e.data;
  //console.log(year, clickedName, sliderValue1, sliderValue2, df_lon_lat);
  // Define la URL del CSV según el año
  const csvUrl = year === "Typical" 
    ? "../assets/P2/correlation_matrix_typical.csv" 
    : `../assets/P2/correlation_matrix_${year}.csv`;

  try {
    const response = await fetch(csvUrl);
    const csvData = await response.text();
    // Parseo del CSV utilizando PapaParse
    const pf = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;
    const i = clickedName.split("_")[1];
    const row = pf[i];
    const filteredRow = Object.keys(row)
    .filter(key => key !== "")  // Excluir la clave ""
    .reduce((obj, key) => {
        obj[key] = row[key];
        return obj;
    }, {});

    
    // Filtrar los elementos por su valor sin ordenar
    const filtered = Object.entries(filteredRow)
        .filter(([key, value]) => parseFloat(value) >= sliderValue1 && parseFloat(value) <= sliderValue2);

    // Realizar el split de las claves y quedarse con la última parte
    const result = filtered.reduce((acc, [key, value]) => {
        const lastPart = key.split('_').pop();  // Tomamos la última parte después del '_'
        acc[lastPart] = value;  // Asignamos al objeto resultante
        return acc;
    }, {});

    const convertedData = Object.fromEntries(
    Object.entries(result).map(([key, value]) => [key, parseFloat(value)])
    );

    // Convertir el objeto a un arreglo, ordenar por los valores, y volver a convertirlo en objeto
    const sortedArray = Object.entries(convertedData).sort(([, valueA], [, valueB]) => valueA - valueB);


    //console.log(sortedArray);

    const keys = sortedArray.map(pair => parseInt(pair[0])-1)
    //console.log(keys);
    const values = sortedArray.map(pair => parseFloat(pair[1]))
    // Obtener las ubicaciones filtradas
    const df_lon_lat2 = keys.map(index => df_lon_lat[index].name);
    // Crear las tres columnas
    const col1 = new Array(df_lon_lat2.length).fill(`${df_lon_lat[i]["name"]}_`).map(value => value.slice(0, -1));
    const col2 = df_lon_lat2.map(row => row);
    const col3 = values;

    // Crear el DataFrame final
    const finalData = {
        "Ubication_1": col1,
        "Ubication_2": col2,
        "Correlation": col3
    };

    // Envía el resultado al hilo principal
    self.postMessage({ finalData, keys });
  } catch (error) {
    self.postMessage({ error: error.toString() });
  }
};
