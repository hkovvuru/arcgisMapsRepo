import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const modulesList = ["esri/Map", "esri/layers/GeoJSONLayer", "esri/views/MapView", "esri/views/SceneView", "esri/widgets/Search", "esri/widgets/LayerList", "esri/widgets/Legend", "esri/widgets/Expand",  "esri/widgets/Sketch","esri/layers/GraphicsLayer"]

const MapView = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    let view;
    let layerList;

    loadModules(modulesList, {
      css: true
    }).then(([Map, GeoJSONLayer, MapView, SceneView, Search, LayerList, Legend, Expand, Sketch, GraphicsLayer]) => {
        const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

        const graphicsLayer = new GraphicsLayer();

    // Pop-up template to display detailed information about each pointer
      const template = {
        title: "Earthquake Info",
        content: "Magnitude {mag} {type} hit {place} on {time}",
        fieldInfos: [
          {
            fieldName: "time",
            format: {
              dateFormat: "short-date-short-time"
            }
          }
        ]
      };

      const renderer = {
        type: "simple",
        field: "mag",
        symbol: {
            type: "simple-marker",
            color: "orange",
            outline: {
                color: "white"
            }
        },
        visualVariables: [
            {
            type: "size",
            field: "mag",
            stops: [
              {
                value: 2.5,
                size: "10px"
              },
              {
                value: 8,
                size: "40px"
              }
            ]
          },
          {
            type: "size",
            field: "Place",
            stops: [
              {
                value: "20 km",
                size: "40px"
              },
              {
                value: "5 km",
                size: "10px"
              }
            ]
          }
        ]
      };

      const geojsonLayer = new GeoJSONLayer({
        url: url,
        copyright: "USGS Earthquakes",
        popupTemplate: template,
        renderer: renderer,
        orderBy: {
          field: "mag"
        }
      });

      const map = new Map({
        basemap: "topo-vector",
        layers: [geojsonLayer, graphicsLayer],
        ground: "world-topobathymetry",
        zoom:8
      });

      view = new MapView({
        container: mapRef.current,
        center: [-168, 46],
        zoom: 3,
        map: map
      });

     // Find Search widget
       const searchWidget = new Search({
         view: view
       });
  
       // Add the search widget to the top right corner of the view
       view.ui.add(searchWidget, {
         position: "top-right"
       });

       const legend = new Expand({
        content: new Legend({
          view: view,
          style: "classic" 
        }),
        view: view,
        expanded: true,
      });
      view.ui.add(legend, "bottom-left");



          view.when(() => {
            const sketch = new Sketch({
              layer: graphicsLayer,
              view: view,
              // graphic will be selected as soon as it is created
              creationMode: "update",
            });
    
            view.ui.add(sketch, "top-right");
        });

    });


    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  return <div style={{ height: "100%", width: "100%" }} ref={mapRef}></div>;
};

export default MapView;