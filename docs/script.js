const zoning = {
"SR-C1": "Suburban Residential - Consistent District 1",
"SR-C2": "Suburban Residential - Consistent District 2",
"SR-C3": "Suburban Residential - Consistent District 3",
"SR-V1": "Suburban Residential - Varied District 1",
"SR-V2": "Suburban Residential - Varied District 2",
"TR-C1": "Traditional Residential - Consistent District 1",
"TR-C2": "Traditional Residential - Consistent District 2",
"TR-C3": "Traditional Residential - Consistent District 3",
"TR-C4": "Traditional Residential - Consistent District 4",
"TR-V1": "Traditional Residential - Varied District 1",
"TR-V2": "Traditional Residential - Varied District 2",
"TR-U1": "Traditional Residential - Urban District 1",
"TR-U2": "Traditional Residential - Urban District 2",
"TR-R": "Traditional Residential - Rustic District",
"TR-P": "Traditional Residential - Planned District",
"LMX": "Limited Mixed-Use",
"NMX": "Neighborhood Mixed-Use District",
"TSS": "Traditional Shopping Street District",
"MXC": "Mixed-Use Center District",
"CC-T": "Commercial Corridor - Transitional District",
"CC": "Commercial Center District",
"TE": "Traditional Employment District",
"SE": "Suburban Employment District",
"SEC": "Suburban Employment Center District",
"EC": "Employment Campus District",
"IL": "Industrial - Limited District",
"IG": "Industrial - General District ",
"DC": "Downtown Core",
"UOR": "Urban Office Residential",
"UMX": "Urban Mixed-Use",
"DR1": "Downtown Residential 1",
"DR2": "Downtown Residential 2",
"A": "Agricultural District",
"UA": "Urban Agricultural District",
"CN": "Conservancy District",
"PR": "Parks and Recreation",
"AP": "Airport District",
"CI": "Campus Institutional District",
"PD": "Planned Development District",
"PMHP": "Planned Mobile Home Park District",
"WP": "Wellhead Protection Overlay Districts",
"W": "Wetland Overlay District",
"TOD": "Transit Oriented Development Overlay District",
"NC": "Neighborhood Conservation Overlay Districts",
"F1": "Floodway District",
"F2": "Flood Fringe District",
"F3": "General Floodplain District",
"F4": "Flood Storage District",
"HIST-L": "Designated Landmark",
"HIST-MH": "Mansion Hill Historic District",
"HIST-TL": "Third Lake Ridge Historic District",
"HIST-UH": "University Heights Historic District",
"HIST-MB": "Marquette Bungalows Historic District",
"HIST-FS": "First Settlement Historic District"
}
	mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0YXJvY2tzIiwiYSI6ImNremtvNDkzaTIwcDYydm4yamF0amFiMmIifQ.F1rByZHul7dtdyK1jmtWsg';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/datarocks/ckzcunvi3000314mvatpef58p', // style URL
        center: [-89.4, 43.07], // starting position [lng, lat]
        zoom: 14 // starting zoom
     });

// wait for map to load before adjusting it
      map.on('load', () => {
        // make a pointer cursor
        map.getCanvas().style.cursor = 'default';

        // set map bounds to the continental US
        //map.fitBounds([
        //  [-133.2421875, 16.972741],
        //  [-47.63671875, 52.696361]
        // ]);

        // define layer names
       const layers = [
          '$0',
          '$0-$0.10',
          '$0.10-$2.00',
          '$2.00-$4.00',
          '$4.00-$6.00',
          '$6.00-$15.00',
          '$15.00-$63.00'
        ];
        const colors = [
          '#cecaca',
          '#eef91a',
          '#f2c936',
          '#e89c4f',
          '#d36d64',
          '#b9467a',
          '#96228e'
        ];


        // create legend
        const legend = document.getElementById('legend');

        layers.forEach((layer, i) => {
          const color = colors[i];
          const item = document.createElement('div');
          const key = document.createElement('span');
          key.className = 'legend-key';
          key.style.backgroundColor = color;

          const value = document.createElement('span');
          value.innerHTML = `${layer}`;
          item.appendChild(key);
          item.appendChild(value);
          legend.appendChild(item);
        });

        // change info window on hover
        map.on('mousemove', (event) => {
          const parcels = map.queryRenderedFeatures(event.point, {
            layers: ['choropleth-fill']
          });
          document.getElementById('pd').innerHTML = parcels.length
            ? `<h3>${parcels[0].properties.taxes_per_sq_foot.toLocaleString("en-US", {style:"currency", currency:"USD"})}</strong> per square foot</em></p>`
            : `<p>Hover over a parcel!</p>`;
        });
      });

map.on("click", "choropleth-fill", e => {
  const parcels = map.queryRenderedFeatures(e.point, { layers: ["choropleth-fill"] });

  if (parcels.length > 0) {
    // const { state, properties } = parcels[0]

    const taxes_sq_ft = `${parcels[0].properties.taxes_per_sq_foot.toLocaleString("en-US", {style:"currency", currency:"USD"})}`

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${parcels[0].properties.Address}</strong> <br> 
      Total taxes: ${parcels[0].properties.TotalTaxes.toLocaleString("en-US", {style:"currency", currency:"USD"})} <br>
      Taxes per square ft: ${taxes_sq_ft} <br>
      Property Use: ${parcels[0].properties.MostCommonPropertyUse} <br>
      Zoning: ${zoning[parcels[0].properties.MostCommonZoning1]} (${parcels[0].properties.MostCommonZoning1}) <br>
      Property Class: ${parcels[0].properties.MostCommonPropertyClass} <br>
      `)
      .addTo(map);
  }
});