// random num between 0 - max
export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// min and max included 
export function randomIntFromInterval(min, max) { 
  return Math.floor(Math.random() * (max - min + 1) + min)
}