"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const Confetti = ({ show }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (show && canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      })

      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [show])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    />
  )
}

export default Confetti
