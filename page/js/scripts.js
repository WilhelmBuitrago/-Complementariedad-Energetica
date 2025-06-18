// Función para generar la consulta SQL a partir de un diccionario
function generateQuerys(qs) {
    const {
      SELECT: select = "*",
      FROM: from,
      JOIN: join = null,
      WHERE: where = null,
      BETWEEN: between = null,
      "GROUP BY": group_by = null,
      LIMIT: limit = null
    } = qs;
  
    if (!from) throw new Error("La clave 'FROM' es obligatoria.");
  
    const fromTable = from.table || "";
    const fromAs = from.as || "";
    let consulta = `SELECT ${select} FROM ${fromTable}`;
  
    if (fromAs || join) consulta += ` AS ${fromAs}`;
  
    if (join) {
      const { type: joinType = "", table: joinTable = "", on: joinOn = "", as: joinAs = "" } = join;
      if (!joinTable || !joinOn)
        throw new Error("La clave 'JOIN' debe contener 'table' y 'on'.");
      consulta += ` ${joinType} JOIN ${joinTable} AS ${joinAs} ON ${fromTable}.${joinOn} = ${joinAs}.${joinOn}`;
    }
  
    if (where) consulta += ` WHERE ${where}`;
  
    if (between) {
      const { campo = "", valor_inicial = "", valor_final = "" } = between;
      if (!campo || !valor_inicial || !valor_final)
        throw new Error("La clave 'BETWEEN' debe contener 'campo', 'valor_inicial' y 'valor_final'.");
      consulta += where
        ? ` AND ${campo} BETWEEN ${valor_inicial} AND ${valor_final}`
        : ` WHERE ${campo} BETWEEN ${valor_inicial} AND ${valor_final}`;
    }
  
    if (group_by) consulta += ` GROUP BY ${group_by}`;
    if (limit) consulta += ` LIMIT ${limit}`;
  
    return consulta;
  }
  
  let lastClickedMarker; // Último marcador clickeado
  let df_lon_lat;        // Datos de ubicaciones obtenidos desde la DB
  let correlationWorker; // Instancia del Web Worker
  
  // Al cargarse la ventana
  window.onload = async () => {
    // Inicializar los sliders
    slideOne();
    slideTwo();
    window.remove_data = false;
  
    try {
      // Inicializar SQL.js y cargar la base de datos
      const SQL = await initSqlJs({
        locateFile: file =>
          `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });
      const response = await fetch('assets/climate_data.db');
      const buffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buffer));
  
      const result = db.exec("SELECT * FROM Locations");
      if (result.length) {
        const { columns, values } = result[0];
        const jsonData = values.map(row =>
          Object.fromEntries(columns.map((col, i) => [col, row[i]]))
        );
        // Ajuste de nombres
        df_lon_lat = jsonData.map(row => {
          if (row.name === 'Bogotá D.C.') row.name = 'Bogotá DC';
          return row;
        });
        const locations = df_lon_lat.map(loc => ({
          name: `${loc.name}_${loc.location_id - 1}`,
          lat: loc.latitude,
          lng: loc.longitude
        }));
        const geojsonData = await fetch('assets/archivo_geojson.json').then(res =>
          res.json()
        );
        renderMap(locations, geojsonData, df_lon_lat);
      } else {
        console.log("No se encontraron datos.");
      }
    } catch (error) {
      console.error("Error al cargar la base de datos:", error);
    }
  
    // Crear e inicializar el Worker
    correlationWorker = new Worker('js\\worker.js');
    correlationWorker.onmessage = function (e) {
      const { error, finalData, keys } = e.data;
      if (error) {
        console.error("Error en el Worker:", error);
        return;
      }
      //console.log(finalData);
      // Actualizar los marcadores según la correlación
      processSelectedLocation(lastClickedMarker, finalData, df_lon_lat, keys);
      console.log(window.remove_data);
      if (window.remove_data){
        
      }
      else {
      updateOutputTable(finalData);
      } 

      // Actualizar la tabla de sal
    };
  };
  
  // --- Sliders y Estilos ---
  
  const sliderOne = document.getElementById("slider-1");
  const sliderTwo = document.getElementById("slider-2");
  const displayValOne = document.getElementById("range1");
  const displayValTwo = document.getElementById("range2");
  const sliderTrack = document.querySelector(".slider-track");
  const sliderMaxValue = +sliderOne.max;
  const sliderMinValue = +sliderOne.min;
  const minGap = 0;
  
  function slideOne() {
    if (+sliderTwo.value - +sliderOne.value <= minGap) {
      sliderOne.value = +sliderTwo.value - minGap;
    }
    displayValOne.textContent = sliderOne.value;
    fillColor();
  }
  
  function slideTwo() {
    if (+sliderTwo.value - +sliderOne.value <= minGap) {
      sliderTwo.value = +sliderOne.value + minGap;
    }
    displayValTwo.textContent = sliderTwo.value;
    fillColor();
  }
  
  function fillColor() {
    const percent1 =
      ((+sliderOne.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) *
      100;
    const percent2 =
      ((+sliderTwo.value - sliderMinValue) / (sliderMaxValue - sliderMinValue)) *
      100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}%, #3264fe ${percent1}%, #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
  }
  
  /* Código XLSX comentado
  fetch('assets/Wind_solar_only_location.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
      const workbook = XLSX.read(data, { type: 'array' });
      // ...
    })
    .catch(error => {
      console.error("Error al cargar el archivo XLSX:", error);
    });
  */
  
  // --- Función para renderizar el mapa y configurar la interacción ---
  function renderMap(locations, geojsonData, df_lon_lat) {
    const geoJsonLayer = L.geoJSON(geojsonData, {
      style: feature => ({
        color: 'black',
        weight: 1,
        fillOpacity: 0.1
      })
    });
    const bounds = geoJsonLayer.getBounds();
    const map = L.map('map', { zoom: 5, minZoom: 5, bounds, maxBounds: bounds }).setView(
      [4.5709, -74.2973],
      5
    );
    geoJsonLayer.addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      updateWhenZooming: true,
      updateWhenIdle: true,
      bounds
    }).addTo(map);
  
    // Función auxiliar para convertir RGB a HEX
    const rgbToHex = (r, g, b) =>
      '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  
    const markers = {};
    locations.forEach(location => {
      const marker = L.marker([location.lat, location.lng]).addTo(map);
      marker.bindPopup(location.name.split("_")[0].toLowerCase());
      markers[location.name] = { marker, originalIcon: marker.options.icon };
      marker.on("click", () => {
        lastClickedMarker = location.name;
        window.remove_data = false;
        updateOutput();
      });
      marker.on("popupclose", () => {
        Object.values(markers).forEach(m => m.marker.setIcon(m.originalIcon));
        if(lastClickedMarker === location.name){
          window.remove_data = true;

          const outputDiv = document.getElementById("output");
          if (outputDiv !== ""){
          outputDiv.innerHTML = "";}
          removeColorbar(); 
        }
      });
    });

    function removeColorbar() {
    if(!d3.select("#colorbar").select("svg").empty()){
      d3.select("#colorbar").select("svg").remove();
      //finalData = None
    }
  }
  
  
    // Función para actualizar el colorbar según la correlación mínima
    function updateColorbar(minCorrelation) {
      const maxCorrelation = 1;
      if(!d3.select("#colorbar").select("svg").empty()){
        d3.select("#colorbar").select("svg").remove();
      }
      const barWidth = 30,
        barHeight = 650,
        margin = { top: 20, right: 50, bottom: 20, left: 10 };
      const svg = d3
        .select("#colorbar")
        .append("svg")
        .attr("width", barWidth + margin.left + margin.right)
        .attr("height", barHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      const colorScale = d3
        .scaleLinear()
        .domain([minCorrelation, maxCorrelation])
        .range(["green", "red"]);
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(minCorrelation));
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(maxCorrelation));
      svg
        .append("rect")
        .attr("x", 10)
        .attr("y", 0)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .style("fill", "url(#gradient)");
      const yScale = d3
        .scaleLinear()
        .domain([minCorrelation, maxCorrelation])
        .range([0, barHeight]);
      svg
        .append("g")
        .attr("transform", `translate(${barWidth + 10},0)`)
        .call(d3.axisRight(yScale).ticks(5));
      svg
        .append("text")
        .attr("x", barWidth + 20)
        .attr("y", 4)
        .attr("fill", "#000")
        .style("font-size", "10px")
        .text(minCorrelation.toFixed(2));
    }
  
    // Función para procesar la ubicación seleccionada y actualizar los marcadores
    function processSelectedLocation(clickedName, finalData, df, keys) {
      if (markers[clickedName])
        markers[clickedName].marker.setIcon(
          L.ExtraMarkers.icon({ markerColor: "blue", shape: "circle" })
        );
      const minCorrelation = Math.min(...finalData.Correlation);
      updateColorbar(minCorrelation);
      const colorScale = d3
        .scaleLinear()
        .domain([minCorrelation, 1])
        .range(["green", "red"]);
      const combinedLocations = {};
      finalData.Ubication_2.forEach((loc, i) => {
        combinedLocations[`${loc}_${keys[i]}`] = i;
      });
      locations.forEach(location => {
        if (
          combinedLocations[location.name] !== undefined &&
          location.name !== clickedName
        ) {
          const correlation = finalData.Correlation[combinedLocations[location.name]];
          markers[location.name].marker.setIcon(
            L.ExtraMarkers.icon({
              icon: "fa-number",
              svg: true,
              markerColor: colorScale(correlation),
              iconColor: colorScale(correlation),
              number: 0,
              shape: "circle"
            })
          );
        }
      });
      locations.forEach((location, index) => {
        if (!keys.includes(index) && location.name !== clickedName) {
          markers[location.name].marker.setIcon(
            L.ExtraMarkers.icon({ markerColor: "black", shape: "circle" })
          );
        }
      });
    }
  
    // Configurar eventos para el slider y el dropdown
    const inputSlider1 = document.getElementById("slider-1");
    const inputSlider2 = document.getElementById("slider-2");
    let debounceTimer
    inputSlider1.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
          updateOutput();
      }, 70); // 300 ms de espera después de la última tecla
    }); 
    //inputSlider1.addEventListener("input", updateOutput);
    inputSlider2.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
          updateOutput();
      }, 70); // 300 ms de espera después de la última tecla
    }); 
  
    const space = document.querySelector(".dropdown");
    const dropdownFace = document.querySelector(".dropdown__face .dropdown__text");
    const dropdownItems = document.querySelectorAll(".dropdown__items li");
    space.addEventListener("click", event => {
      event.stopPropagation();
      if (space.dataset.clicked === "true") return;
      space.dataset.clicked = "true";
      setTimeout(() => (space.dataset.clicked = "false"), 50);
      space.style.marginBottom =
        space.style.marginBottom === "90px" ? "-120px" : "90px";
    });
    dropdownItems.forEach(item => {
      item.addEventListener("click", () => {
        dropdownFace.textContent = item.getAttribute("data-value");
        space.style.marginBottom = "-120px";
        updateOutput();
      });
    });
  
    // Hacemos accesible la función processSelectedLocation en el ámbito global para el Worker
    window.processSelectedLocation = processSelectedLocation;
  }
  
  // --- Función para enviar datos al Worker ---
  async function updateOutput() {
    const input1 = parseFloat(document.getElementById("slider-1").value);
    const input2 = parseFloat(document.getElementById("slider-2").value);
    const dropdownFace = document.querySelector(".dropdown__face .dropdown__text");
    const selectedYear = dropdownFace.textContent;
    console.log(selectedYear);
    //console.log("Actualizando datos:", {lastClickedMarker, input1, input2, selectedYear });
    if (lastClickedMarker && correlationWorker && (selectedYear != 'Seleccionar año')) {
      
      correlationWorker.postMessage({
        year: selectedYear,
        clickedName: lastClickedMarker,
        sliderValue1: input1,
        sliderValue2: input2,
        df_lon_lat: df_lon_lat
      });
    }
  }
  
  // --- Función para actualizar la tabla de salida ---
  function updateOutputTable(finalData) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "";
    const tableContainer = document.createElement("div");
    tableContainer.className = "table-container";
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    Object.keys(finalData).forEach(key => {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    const numRows = finalData.Ubication_1.length;
    for (let i = 0; i < numRows; i++) {
      const dataRow = document.createElement("tr");
      for (const key in finalData) {
        const td = document.createElement("td");
        td.textContent = finalData[key][i];
        td.style.border = "1px solid black";
        td.style.padding = "8px";
        dataRow.appendChild(td);
      }
      table.appendChild(dataRow);
    }
    tableContainer.appendChild(table);
    outputDiv.appendChild(tableContainer);
  }
  