/* eslint-disable @typescript-eslint/no-for-in-array */
export class Neuron {
  net: number
  derived: number
  error: number
  obtained: number

  calculatedNet = (layers: number[], weights: number[][], pos: number): void => {
    this.net = 0
    for (let layer = 0; layer < layers.length; layer++) {
      console.log('estou aqui ',pos,layer)
      console.log('conta >>>>',layers[layer],weights[pos][layer],'result',layers[layer] * weights[pos][layer])
      console.log('----------------')
      this.net += layers[layer] * weights[pos][layer]
    }
  }

  linear = (): void => {
    this.obtained = this.net / 10.0
    this.derived = 0.1
  }

  logistic = (): void => {
    this.obtained = (1 / (1 + Math.pow(Math.E, (-this.net))))
    this.derived = this.obtained * (1 - this.obtained)
  }

  hiperbolic = (): void => {
    this.obtained = (((1 - (Math.pow(Math.E, (-2 * this.net))))) / (1 + (Math.pow(Math.E, (-2 * this.net)))))
    this.derived = (1 - (Math.pow(this.obtained, 2)))
  }

  calculatedExitError = (desejed: number): void => {
    console.log('conta >>>>',desejed,this.obtained,this.derived,'result',(desejed - this.obtained) * this.derived)
    this.error = (desejed - this.obtained) * this.derived
  }

  calculatedHiddenError = (layers: number[], weights: number[][], pos: number): void => {
    this.error = 0
    for (const layer in layers) {
      console.log('estou aqui ',pos,layer)
      console.log('conta >>>>',layers[layer],weights[pos][layer],'result',layers[layer] * weights[pos][layer])
      this.error += layers[layer] * weights[pos][layer]
    }
    this.error *= this.derived
  }
}
