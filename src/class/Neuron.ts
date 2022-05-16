/* eslint-disable @typescript-eslint/no-for-in-array */
export class Neuron {
  net: number
  derived: number
  error: number
  obtained: number

  calculatedNet = (layers: number[], weights: number[][], pos: number): void => {
    this.net = 0
    for (const layer in layers) {
      this.net += layers[layer] * weights[pos][layer]
    }
  }

  linear = (): void => {
    this.obtained = this.net / 10.0
    this.error = 0.1
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
    this.error = (desejed - this.obtained) * this.derived
  }

  calculatedHiddenError = (layers: number[], weights: number[], pos: number): void => {
    this.error = 0
    for (const layer in layers) {
      this.error += layers[layer] * weights[layer][pos]
    }
    this.error *= this.derived
  }
}
