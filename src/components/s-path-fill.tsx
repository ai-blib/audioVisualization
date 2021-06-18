import React, { useEffect, useRef } from "react";
import { Canvas, IShape } from '@antv/g-canvas';
import { formatToTransit, addColorOpacity } from '../utils'
import { line, curveCardinalClosed } from 'd3'
interface SPathFillProps {
  data?: Uint8Array;
  freshTime?: number;
}

export default function SLine(props: SPathFillProps) {
  const POINT_NUM = 64
  const X = 200
  const Y = 200
  const R = 100
  const COLORS = ['#cdf5dd', '#e8fdc8', '#dafcf0', '#f3f8c9']

  const canvas = useRef<Canvas>()
  const SPathFillArr = useRef<IShape[]>([])

  function getArray(arr: Uint8Array) {
    let _arr: number[] = [];
    [...arr].map((item,index) => {
      if (index % 2) {
        _arr.push(item)
      }
    })
    return formatToTransit(_arr, 5, 0.75)
  }

  function getPointByIndex(index: number, addHeight = 0):[number, number] {
    const deg = index * (360 / POINT_NUM) - 150;
    const l = Math.cos(deg * Math.PI / 180)
    const t = Math.sin(deg * Math.PI / 180)
    const r = R + addHeight
    return [X + l * r, Y + t * r]
  }

  useEffect(() => {
    if (props.data) {
      const pathArr: any[] = [[],[],[],[]]
      getArray(props.data).map((item,index) => {
        pathArr[index % 4].push(getPointByIndex(index, item * item / 65025 * 30))
      })
      pathArr.map((item,index) => {
        const path = line().x((d: [number,number]) => d[0]).y((d: [number, number]) => d[1]).curve(curveCardinalClosed)(item)
        SPathFillArr.current[index].attr('path', path)
      })
    }
  }, [
    props.freshTime
  ])

  useEffect(() => {
    canvas.current = new Canvas({
      container: 'SPathFill',
      width: 400,
      height: 400,
    });

    canvas.current.addShape('circle', {
      attrs: {
        x: X,
        y: Y,
        r: R,
        fill: '#f5f5f7',
        shadowColor: COLORS[0],
        shadowBlur: 10
      }
    }).setZIndex(2);

    const PointArr = Array.from({ length: POINT_NUM / 4 }, (item, index: number) => {
      return getPointByIndex(index * 4)
    })
    const path = line().x((d: [number,number]) => d[0]).y((d: [number, number]) => d[1]).curve(curveCardinalClosed)(PointArr)
    Array.from({ length: 4 }, (item, index: number) => {
      SPathFillArr.current.push((canvas.current as Canvas).addShape('path', {
        attrs: {
          stroke: COLORS[index],
          lineWidth: 1,
          path,
          fill: addColorOpacity(COLORS[index], .4)
        }
      }).setZIndex(1))
    })
    
  }, [])

  return (
    <div className="s-model">
      <div id="SPathFill" className="s-canvas-wrapper"></div>
    </div>
  )
}