import React, { StatelessComponent } from "react"
import { pure, compose, withState, Omit } from "recompose"
import coarsify from "helpers/coarsify"

import "./Knob.css"

// 最大値になるまでのドラッグ移動量
const MAX_VALUE_MOVE_LENGTH = 150

// ホイール1行分の回転による変化量
const WHEEL_SPEED = 0.1

export interface KnobProps {
  value: number
  onChange: (value: number) => void
  offsetDegree: number
  maxDegree: number
  maxValue: number
  minValue: number
  dragging: boolean
  setDragging: (dragging: boolean) => void
}

const Knob: StatelessComponent<KnobProps> = ({
  value = 0,
  onChange = () => {},
  offsetDegree = 0,
  maxDegree = 360,
  maxValue = 1,
  minValue = 0,
  dragging = false,
  setDragging = () => {}
}) => {
  const range = maxValue - minValue

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const movement = e.deltaY > 0 ? -1 : 1
    value = coarsify(value + movement * WHEEL_SPEED * range, minValue, maxValue)
    onChange(value)
  }

  function handleMouseDown(e: React.MouseEvent) {
    const startY = e.clientY

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    setDragging(true)

    function onMouseMove(e: MouseEvent) {
      const delta = e.clientY - startY
      const val = value - (delta * range) / MAX_VALUE_MOVE_LENGTH
      value = coarsify(val, minValue, maxValue)
      onChange(value)
    }

    function onMouseUp() {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      setDragging(false)
    }
  }

  return (
    <div
      className={`Knob ${dragging ? "dragging" : ""}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      <div className="body">
        <div
          className="mark"
          style={{
            transform: `rotate(${(value / range) * maxDegree +
              offsetDegree}deg)`
          }}
        >
          <div className="dot" />
        </div>
      </div>
      <div className="value">{value}</div>
    </div>
  )
}

export default compose<KnobProps, Omit<KnobProps, "dragging" | "setDragging">>(
  pure,
  withState("dragging", "setDragging", false)
)(Knob)