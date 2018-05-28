/* global load, update, draw, ctx, spriteCtx, CANVAS_SIZE, GRID_SIZE, GRID_NUMBER */
/* eslint no-unused-vars: 0 */

c(typeof GRID_NUMBER)

if (typeof draw !== 'function') throw new Error('You must define a "draw" function.')

const UPDATE_WAIT = 3

function rect(x, y, width, height, outline = false, color = null) {
  ctx.rect(x, y, width, height)
  if (outline) {
    ctx.stroke()
  } else {
    ctx.fill()
  }
}

const sprites = []

function sprite(i, x, y) {
  if (!sprites[i]) {
    sprites[i] = spriteCtx.getImageData(
      i % GRID_NUMBER,
      Math.floor(i / GRID_NUMBER),
      GRID_SIZE,
      GRID_SIZE,
    )
  }
  ctx.putImageData(sprites[i], x, y)
}

if (typeof load === 'function') load()

let currentTime = 0
function main(timestamp) {
  let frameTime = timestamp - currentTime

  if (frameTime >= UPDATE_WAIT) {
    currentTime = timestamp
    let accumulator = frameTime

    while (accumulator >= UPDATE_WAIT) {
      if (typeof update === 'function') update()
      accumulator -= UPDATE_WAIT
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    draw()
  }
  window.requestAnimationFrame(main)
}
window.requestAnimationFrame(main)
