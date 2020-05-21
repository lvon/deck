import React, {useState, useEffect, createRef} from 'react'
import DeckGL from '@deck.gl/react'
import {StaticMap} from 'react-map-gl'
import {Tiles3DLoader} from '@loaders.gl/3d-tiles'
import {Tile3DLayer} from '@deck.gl/geo-layers'
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers'
import {Matrix4} from 'math.gl'
import {FlyToInterpolator} from 'deck.gl'
import {LightingEffect, _SunLight as SunLight, PointLight} from '@deck.gl/core'

import {debounce} from 'lodash'
import mapboxStyle from './mapboxStyle'
import geoJson from './geojson'
import polygon from './polygon'
import nameGeo from './name'


window.oncontextmenu = function (e) {
  // 取消默认的浏览器自带右键 很重要！！
  e.preventDefault() 
}


const Deck = () => {
  const [layers, setLayers] = useState([])
  const deck = createRef()
  window.deck = deck

  const initViewState = {
    longitude: 120.16735957533727,
    latitude: 30.165954724984655,
    zoom: 18,
    pitch: 0,
    bearing: 30,
    maxPitch: 90,
    transitionDuration: 3000,
    transitionInterpolator: new FlyToInterpolator(),
  }
  const [xy, setXY] = useState([0, 0])

  const [viewState, setViewState] = useState(initViewState)


  const flyTo = xyz => {
    setViewState({
      ...viewState,
      ...xyz,
    })
  }

  useEffect(() => {
    // const debounceSetXY = debounce(() => {
    if (deck?.current?.viewports) {
      console.log('11111')
      const [x, y] = deck.current.viewports[0].project([120.16902492151641, 30.167722553749094, 57.1])
      setXY([x, y])
    }
    // }, 100)
    // debounceSetXY()
  },
  [viewState])

  // window.flyTo = flyTo
  // window.setViewState = setViewState
  useEffect(() => {
    // 倾斜摄影模型 火炬小区
    const real3Dlayer = new Tile3DLayer({
      id: 'real-3d-layer',
      data: 'https://smartc.wasu.cn/3dtile/tileset.json',
      loader: Tiles3DLoader,
      onTileLoad: tileHeader => {
        // console.log('3d tileHeader',tileHeader)
        const x = -90 / 180 * Math.PI
        tileHeader.content.modelMatrix = new Matrix4(tileHeader.content.modelMatrix).rotateX(x).translate([0, 0, -19])
        return tileHeader
      },
    })


    // 火炬小区楼栋名称
    const nameLayer = new TextLayer({
      id: 'geojson-name',
      data: 'https://yfcctv.wasu.cn/shidian-mapdata/area/village/huojvxiaoqu-label.geojson',
      dataTransform: data => data.features,
      getPosition: d => [...d.geometry.coordinates, d.properties.height],
      getText: d => d.properties.name,
      getSize: 32,
      getAngle: 0,
      getTextAnchor: 'start',
      getAlignmentBaseline: 'center',
      getTransformMatrix: d => {
        console.log(d)
      },
      backgroundColor: [255, 255, 0],
      pickable: true,
      getColor: [255, 0, 0, 255],
      onHover: (a, b) => {
        console.log('a:', a)
        console.log('b:', b)
      },
    })

    window.nameLayer = nameLayer


    // 火炬小区拉高模型
    const polygonLayer = new GeoJsonLayer({
      id: 'geojson-click',
      data: 'https://yfcctv.wasu.cn/shidian-mapdata/area/building/huojvxiaoqu.geojson',
      pickable: true,
      filled: true,
      extruded: true,
      opacity: 0,
      getElevation: obj => obj.properties.height,
      onClick: (obj, event) => {
        console.log(obj.object.properties.name)
        console.log(event)
        return true
      },
    })

    // 火炬小区边界范围
    const shapeLayer = new GeoJsonLayer({
      id: 'geojson-layer',
      data: 'https://yfcctv.wasu.cn/shidian-mapdata/area/village/huojvxiaoqu.geojson',
      pickable: true,
      stroked: true,
      filled: false,
      getLineColor: [0, 0, 255, 100],
      getLineWidth: 5,
      onHover: ({object, x, y}) => {
        if (object) {
          if (document.getElementById('test')) {
            const div = document.getElementById('test')
            div.style.top = `${y}px`
            div.style.left = `${x}px`
          } else {
            const div = document.createElement('div')
            div.id = 'test'
            div.style.position = 'fixed'
            div.style.top = `${y}px`
            div.style.left = `${x}px`
            div.style.padding = '8px'
            div.style.background = 'rbga(255,255,255,0.4)'
            div.innerHTML = object.properties.name

            document.body.appendChild(div)
          }
        } else {
          document.getElementById('test') && document.getElementById('test').remove()
        }
      },
    })

    setLayers([
      nameLayer,
      shapeLayer,
      real3Dlayer,
      polygonLayer,
    ])
  }, [])


  return <div
    id="map"
    style={{
      transform: 'scale(0.85)',
      height: '90vh',
      width: '90vw',
      margin: '40px',
    }}>

    <button 
      onClick={() => {
        flyTo(initViewState)
      }}>
      test
    </button>

    <div>{JSON.stringify(viewState)}</div>
    <DeckGL
      ref={deck}
      viewState={viewState}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
      controller
      layers={layers}
      // effects={[
      //   new LightingEffect({
      //     sunLight: new SunLight({
      //       timestamp: new Date('2020-05-21 12:00').getTime(), 
      //       color: [255, 255, 255],
      //       intensity: 1,
      //     }),
      //     pointerLight: new PointLight({
      //       color: [128, 128, 0],
      //       intensity: 0.02,
      //       position: [120.16902492151641, 30.167722553749094, 200],
      //       //         longitude: 120.16735957533727,
      //       // latitude: 30.165954724984655,
      //     }),
      //   }),
        
      // ]}
      // onClick={(info, event) => {
      //   console.log(info, event)
      // }}
      // getTooltip={info => {
      //   // console.log(info)
      //   const rs = {
      //     text: `${JSON.stringify(info.coordinate)}<br/>${JSON.stringify(info.pixel)}`,
      //   }
      //   return rs
      // }}

      onViewStateChange={state => {
        // console.log(state)
        setViewState(state.viewState)
      }}

    >
      <StaticMap
        draggable
        mapboxApiAccessToken="pk.eyJ1IjoibHZvbiIsImEiOiJjazIyb2gwczEwbjhrM2NuMDJwdWtoZG1wIn0.ry6dA_3yn1iAstmqMABGKw"
        mapStyle={mapboxStyle}
      />

    </DeckGL>
    <div
      style={{
        position: 'fixed',
        left: xy[0],
        top: xy[1],
        height: '10px',
        width: '10px',
        background: 'red',
        zIndex: 10,
      }}
    >{JSON.stringify(xy)}</div>
  </div>
}
export default Deck
