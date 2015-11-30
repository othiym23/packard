export function parseGapless (data) {
  const parsed = data.trim().split(' ').map(v => parseInt(v, 16))
  return {
    encoderDelaySamples: parsed[1],
    endPaddingSamples: parsed[2],
    originalSampleCount: parsed[3],
    raw: data
  }
}

export function parseNormalization (data) {
  const parsed = data.trim().split(' ').map(v => parseInt(v, 16))
  return {
    adjustment1000L: parsed[0],
    adjustment1000R: parsed[1],
    adjustment2500L: parsed[2],
    adjustment2500R: parsed[3],
    statisticsL: parsed[4],
    statisticsR: parsed[5],
    peakL: parsed[6],
    peakR: parsed[7],
    unknownL: parsed[8],
    unknownR: parsed[9],
    raw: data
  }
}
