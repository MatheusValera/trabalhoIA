/* eslint-disable @typescript-eslint/no-for-in-array */
import { Neuron } from './Neuron'

export class HiddenLayer {
  hiddenLayer: Neuron[]
  hiddenWeights: number[][]
  exitWeights: number[][]

  constructor (qtdEntries?: number, qtdHidden?: number, qtdExit?: number) {
    if (qtdEntries && qtdHidden && qtdExit) {
      this.hiddenLayer = new Neuron[qtdHidden]()
      this.hiddenLayer.forEach((elem,i) => {
        if (i < qtdHidden) { elem = new Neuron() }
      })
      this.hiddenLayer = new Number[qtdHidden][qtdEntries]()
      this.exitWeights = new Number[qtdExit][qtdHidden]()
    }
  }

  correctWeightsHidden (txAp: number, camEnt: number[]): void {
    for (const layer in this.hiddenLayer) {
      for (const ent in camEnt) {
        this.hiddenWeights[layer][ent] = this.hiddenWeights[layer][ent] + (txAp * this.hiddenLayer[layer].error * camEnt[ent])
      }
    }
  }

  correctExitWeight (txAp: number, error: number[]): void {
    for (const err in error) {
      for (const layer in this.hiddenLayer) { this.exitWeights[err][layer] = this.exitWeights[err][layer] + (txAp * error[err] * this.hiddenLayer[layer].obtained) }
    }
  }

  generatedWeight (qtdEntries: number, qtdExit: number): void {
    for (const layer in this.hiddenLayer) {
      for (let i = 0; i < qtdEntries; i++) { this.hiddenWeights[layer][i] = (-2) + Math.random() * (2 - (-2)) }
    }
    for (let i = 0; i < qtdExit; i++) {
      for (const layer in this.hiddenLayer) { this.exitWeights[i][layer] = (-2) + Math.random() * (2 - (-2)) }
    }
  }
}
