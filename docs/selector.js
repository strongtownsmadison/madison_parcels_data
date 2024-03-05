
	mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0YXJvY2tzIiwiYSI6ImNremtvNDkzaTIwcDYydm4yamF0amFiMmIifQ.F1rByZHul7dtdyK1jmtWsg';

  var total_taxes = null;
  var total_lot_size = null;

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-89.4, 43.07], // starting position [lng, lat]
        zoom: 14
    });

    // Disable default box zooming.
    map.boxZoom.disable();

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false
    });

    map.on('load', () => {
        const canvas = map.getCanvasContainer();

        // Variable to hold the starting xy coordinates
        // when `mousedown` occured.
        let start;

        // Variable to hold the current xy coordinates
        // when `mousemove` or `mouseup` occurs.
        let current;

        // Variable for the draw box element.
        let box;

        // Add a custom vector tileset source. The tileset used in
        // this example contains a feature for every county in the U.S.
        // Each county contains four properties. For example:
        // {
        //     COUNTY: "Uintah County",
        //     FIPS: 49047,
        //     median-income: 62363,
        //     population: 34576
        // }
       map.addSource('parcels', {
           'type': 'vector',
           'url': 'mapbox://datarocks.3j9rj47w'
       });

       map.addLayer(
           {
               'id': 'parcels',
             'type': 'fill',
               'source': 'parcels',
               'source-layer': 'madison_taxes_per_sq_foot-dbsyyj',
               'paint': {
                   'fill-outline-color': 'rgba(0,0,0,0.1)',
                   'fill-color': 'rgba(0,0,0,0.1)'
               }
           },
           'settlement-label'
       ); // Place polygon under these labels.

        map.addLayer(
            {
                'id': 'parcels-highlighted',
                'type': 'fill',
                'source': 'parcels',
                'source-layer': 'madison_taxes_per_sq_foot-202-49w0dd',
                'paint': {
                    'fill-outline-color': '#484896',
                    'fill-color': '#6e599f',
                    'fill-opacity': 0.75
                },
                'filter': ['in', 'XRefParcel', '']
            },
            'settlement-label'
        ); // Place polygon under these labels.

        // Set `true` to dispatch the event before other functions
        // call it. This is necessary for disabling the default map
        // dragging behaviour.
        canvas.addEventListener('mousedown', mouseDown, true);

        // Return the xy coordinates of the mouse position
        function mousePos(e) {
            const rect = canvas.getBoundingClientRect();
            return new mapboxgl.Point(
                e.clientX - rect.left - canvas.clientLeft,
                e.clientY - rect.top - canvas.clientTop
            );
        }

        function mouseDown(e) {
            // Continue the rest of the function if the shiftkey is pressed.
            if (!(e.shiftKey && e.button === 0)) {return;}

            // Disable default drag zooming when the shift key is held down.
            map.dragPan.disable();

            // Call functions for the following events
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('keydown', onKeyDown);

            // Capture the first xy coordinates
            start = mousePos(e);
        }

        function onMouseMove(e) {
            // Capture the ongoing xy coordinates
            current = mousePos(e);

            // Append the box element if it doesnt exist
            if (!box) {
                box = document.createElement('div');
                box.classList.add('boxdraw');
                canvas.appendChild(box);
            }

            const minX = Math.min(start.x, current.x),
                maxX = Math.max(start.x, current.x),
                minY = Math.min(start.y, current.y),
                maxY = Math.max(start.y, current.y);

            // Adjust width and xy position of the box element ongoing
            const pos = `translate(${minX}px, ${minY}px)`;
            box.style.transform = pos;
            box.style.width = maxX - minX + 'px';
            box.style.height = maxY - minY + 'px';
        }

        function onMouseUp(e) {
            // Capture xy coordinates
            finish([start, mousePos(e)]);
        }

        function onKeyDown(e) {
            // If the ESC key is pressed
            if (e.keyCode === 27) {finish();}
        }

        function finish(bbox) {
            // Remove these events now that finish has been called.
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('mouseup', onMouseUp);

            if (box) {
                box.parentNode.removeChild(box);
                box = null;
            }

            // If bbox exists. use this value as the argument for `queryRenderedFeatures`
            if (bbox) {
                total_taxes = null;
                total_lot_size = null;
                const features = map.queryRenderedFeatures(bbox, {
                    layers: ['parcels']
                });

                if (features.length >= 1000) {
                    return window.alert('Select a smaller number of features');
                }

                // Run through the selected features and set a filter
                // to match features with unique XRefParcel ids to activate
                // the `parcels-highlighted` layer.
                const xrefparcels = features.map((feature) => feature.properties.XRefParcel);
                map.setFilter('parcels-highlighted', ['in', 'XRefParcel', ...xrefparcels]);
                const netTaxes_array = features.map((feature) => feature.properties.NetTaxes);
                const lotSize_array = features.map((feature) => feature.properties.LotSize);
                total_taxes = netTaxes_array.reduce((partialSum, a) => partialSum + a, 0);
                total_lot_size = lotSize_array.reduce((partialSum, a) => partialSum + a, 0);
                console.log(total_taxes);
            }

            map.dragPan.enable();
        }

        map.on('mousemove', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['parcels-highlighted']
            });

            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = features.length ? 'pointer' : '';

            if (!features.length) {
                popup.remove();
                return;
            }

            popup
                .setLngLat(e.lngLat)
                .setHTML(`Total taxes paid in the highlighted area: ${total_taxes.toLocaleString("en-US", {style: "currency", currency: "USD"})}
                     <br> Total Lot Size: ${(total_lot_size/43560).toLocaleString("en-US")} acres`)
                .addTo(map);
        });
    })
