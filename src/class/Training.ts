/* eslint-disable @typescript-eslint/no-useless-constructor */
import { HiddenLayer } from './HiddenLayer'
import { Neuron } from './Neuron'

export class Training {
  layersEntries: number[]
  hiddenLayer: HiddenLayer
  exitLayer: Neuron[]
  networkError: number

  constructor () {}

  calculatedNetworkError (): void {
    for (const layer of this.exitLayer) { this.networkError += Math.pow(layer.error,2) }
    this.networkError = this.networkError * 0.5
  }
}
