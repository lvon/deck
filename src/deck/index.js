import React, {useState, useEffect} from 'react'
import DeckGL from '@deck.gl/react'
import {StaticMap} from 'react-map-gl'
import {CesiumIonLoader, Tiles3DLoader} from '@loaders.gl/3d-tiles'
import {Tile3DLayer} from '@deck.gl/geo-layers'
import mapboxStyle from './mapboxStyle'

window.oncontextmenu = function (e) {
  // 取消默认的浏览器自带右键 很重要！！
  e.preventDefault() 
}

const Deck = () => {
  const [layers, setLayers] = useState([])
  useEffect(() => {
    // effect
    // return () => {
    //   cleanup
    // // }
    // const deckInstance = new DeckGL({
    //   mapboxApiAccessToken: 'pk.eyJ1IjoibHZvbiIsImEiOiJjazIyb2gwczEwbjhrM2NuMDJwdWtoZG1wIn0.ry6dA_3yn1iAstmqMABGKw',
    //   mapStyle: style,
    //   initialViewState: {
    //     longitude: 118.988491,
    //     latitude: 32.139774,
    //     zoom: 12
    //   },
    //   controller: true,
    //   container: 'map',
    //   layers: [
    //     new deck.Tile3DLayer({
    //       id: 'tile-3d-layer',
    //       // tileset json file url 
    //       data: 'http://hxxixia.lcfw.co:7119/nanjingmapdata/realModel/TYY-3DTiles2/Scene/TYYm3DTiles2.json',
    //       loader: deck.CesiumIonLoader,
    //     })
    //   ]
    // });
    console.log('CesiumIonLoader:', CesiumIonLoader)
    setLayers([
      new Tile3DLayer({
        id: 'tile-3d-layer',
        // tileset json file url 
        data: 'https://cdn.ilvon.cn/lvcheng/nanjing/whiteModel/tianyouyuan/tileset.json',
        loader: Tiles3DLoader,
        onTilesetLoad: tileHeader => {
          console.log('load', tileHeader)
        },
        opacity: 0.5,
        modelMatrix: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      }),

      new Tile3DLayer({
        id: 'real-3d-layer',
        // tileset json file url 
        data: 'https://smartc.wasu.cn/3dtile/tileset.json',
        loader: Tiles3DLoader,
        loadOptions: {
          tileset: {
            type: 'scenegraph',
          },
        },
        onTilesetLoad: () => {
          console.log('load')
        },
        onTileError: (tileHeader, url, message) => {
          console.log(url, message)
        },
      }),
    ])
  }, [])
  return <div
    id="map"
    style={{
      height: '90vh',
      width: '90vw',
      margin: '40px',
    }}>
    <DeckGL
      initialViewState={{
        // longitude: 118.988491,
        // latitude: 32.139774,
        longitude: 120,
        latitude: 30,
        zoom: 12,
        pitch: 60,
        bearing: 0,
      }}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
      controller
      layers={layers}
    >
      <StaticMap
        draggable
        mapboxApiAccessToken="pk.eyJ1IjoibHZvbiIsImEiOiJjazIyb2gwczEwbjhrM2NuMDJwdWtoZG1wIn0.ry6dA_3yn1iAstmqMABGKw"
        mapStyle={mapboxStyle}
      />

    </DeckGL>

  </div>
}
export default Deck
