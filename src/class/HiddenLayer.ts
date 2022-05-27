/* eslint-disable @typescript-eslint/no-for-in-array */
import { Neuron } from './Neuron'

export class HiddenLayer {
  hiddenLayer: Neuron[]
  hiddenWeights: number[][]
  exitWeights: number[][]

  constructor (qtdEntries?: number, qtdHidden?: number, qtdExit?: number) {
    if (qtdEntries && qtdHidden && qtdExit) {
      this.hiddenLayer = this.generateList(qtdHidden)
      this.hiddenWeights = this.generateMatrix(qtdHidden,qtdEntries)
      this.exitWeights = this.generateMatrix(qtdExit,qtdHidden)
    }
  }

  generateList (length: number): any {
    const list = []
    for (let i = 0; i < length; i++) {
      list.push(new Neuron())
    }

    return list
  }

  generateMatrix (line: number, column: number): any {
    const list = []
    for (let i = 0; i < line; i++) {
      list.push([])
      for (let j = 0; j < column; j++) {
        list[i].push(0)
      }
    }
    return list
  }

  correctWeightsHidden (txAp: number, camEnt: number[]): void {
    for (const layer in this.hiddenLayer) {
      for (const ent in camEnt) {
        this.hiddenWeights[layer][ent] = this.hiddenWeights[layer][ent] + (txAp * this.hiddenLayer[layer].error * camEnt[ent])
      }
    }
  }

  correctExitWeight (txAp: number, error: number[]): void {
    console.log(this.exitWeights,error)
    for (const err in error) {
      for (const layer in this.exitWeights) {
        console.log('estou aqui ',err,layer)
        console.log('conta >>>>',this.exitWeights[layer][err],(txAp * error[err] * this.hiddenLayer[layer].obtained),'result',this.exitWeights[layer][err] + (txAp * error[err] * this.hiddenLayer[layer].obtained))
        this.exitWeights[layer][err] = this.exitWeights[layer][err] + (txAp * error[err] * this.hiddenLayer[layer].obtained)
      }
    }
  }

  generatedWeight (qtdEntries: number, qtdExit: number): void {
    for (let layer = 0; layer < this.hiddenLayer.length; layer++) {
      for (let i = 0; i < qtdEntries; i++) {
        this.hiddenWeights[layer][i] = (-2) + Math.random() * (2 - (-2))
      }
    }
    for (let i = 0; i < qtdExit; i++) {
      for (const layer in this.hiddenLayer) { this.exitWeights[i][layer] = (-2) + Math.random() * (2 - (-2)) }
    }
  }
}
