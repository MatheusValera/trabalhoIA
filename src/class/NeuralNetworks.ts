/* eslint-disable @typescript-eslint/brace-style */
import fs from 'fs'
import { Training } from '../class/Training'
import { HiddenLayer } from '../class/HiddenLayer'
import { Neuron } from '../class/Neuron'

const readFile = async (nameFile: string): Promise<any> => {
  const file = fs.readFileSync('../tests/' + nameFile,'utf-8')
  const list = file.split('\r\n')
  const matrix = []
  list.forEach(line => {
    matrix.push(line.toString().split(','))
  })
  return matrix
}

const generateMatrix = (column: number, line: number): any => {
  const list = []
  for (let i = 0; i < line; i++) {
    list.push([])
    for (let j = 0; j < column; j++) {
      list[i].push(0)
    }
  }
  return list
}

const normalize = (list: any): void => {
  const results = []
  if (list.length > 0) {
    for (const column in list[0]) {
      let bigger = list[0][column]
      let smaller = list[0][column]
      for (const line in list) {
        const valored = list[line][column]
        if (valored > bigger) { bigger = valored }
        if (valored < smaller) { smaller = valored }
      }
      const interval = bigger - smaller
      for (const line in list) {
        list[line][column] -= smaller
        list[line][column] /= interval
      }
      results.push([])
      results[results.length - 1].push(smaller)
      results[results.length - 1].push(bigger)
    }
  }
}

const valueResults = (list: any): any => {
  const col: number = list[0].length - 1
  let value: number

  const exitResult = []

  for (const line of list) {
    value = line[line][col]
    if (!exitResult.includes(value)) { exitResult.push(value) }
  }
  return exitResult
}

const generateLayers = (list: any): any => {
  let training: Training[]
  // const entry = list[0].length - 1
  const entries = []
  // const exit = valueResults(list).length

  for (const line in list) {
    const auxTraining: Training = new Training()
    for (const column in list[line]) {
      entries[column] = list[line][column]
    }
    auxTraining.layersEntries = entries
    training.push(auxTraining)
  }

  return training
}

const desiredMatrix = (list: any, exit: number, selected: number): any => {
  const desiredMatrix = generateMatrix(exit,exit)
  for (let i = 0; i < exit; i++) {
    for (let j = 0; j < exit; j++) {
      if (selected === 3) {
        if (i === j) { desiredMatrix[i][j] = 1 } else { desiredMatrix[i][j] = -1 }
      } else {
        if (i === j) { desiredMatrix[i][j] = 1 } else { desiredMatrix[i][j] = 0 }
      }
    }
  }
  return desiredMatrix
}

const selectedTest = async (nameFile: string): Promise<void> => {
  const data = await readFile(nameFile)
  await normalize(data)
}

const executeTest = async (nameFile: string, exit: number, minError: number, nroIterations: number, rateLearning: number, exitType: number): Promise<any> => {
  const matrixTest = await readFile(nameFile)
  const training = generateLayers(matrixTest)
  let hiddenWeights = []
  let exitWeights = []
  if (matrixTest) {
    let desiredExit = 0
    let iterationError = -10000
    let entries, hiddens
    let lineError = 0
    const iterationE = []
    const values = valueResults(matrixTest)
    const desiredM = desiredMatrix(matrixTest, exit, exitType)
    const hiddenWeightsFinal = []
    const exitWeightsFinal = []
    const hiddenVet = []
    const exitErrors = []
    let hiddenMatrix = generateMatrix(hiddens, entries)
    let exitMatrix = generateMatrix(exit,hiddens)
    let weight = 1
    training.forEach((train) => {
      train.hiddenLayer = new HiddenLayer(entries,hiddens,exit)
      train.exitLayer = []
      for (let i = 0; i < exit; i++) { train.exitLayer.push(new Neuron()) }
      train.hiddenLayer.generatedWeight(entries,exit)
      weight++
    })
    console.log(weight)
    for (let i = 0; i < exit; i++) {
      hiddenWeightsFinal.push(hiddenMatrix)
      exitWeightsFinal.push(exitMatrix)
    }
    let i = 0
    do {
      iterationError = 0
      let count = 0
      training.forEach((train) => {
        if (count !== matrixTest.length - 1) {
          const index = matrixTest[count][entries]
          for (let k = 0; k < exit; k++) {
            if (index === values[k]) {
              desiredExit = k
              k = exit
            }
            hiddenWeightsFinal[desiredExit] = train.hiddenLayer.hiddenWeights
            exitWeightsFinal[desiredExit] = train.hiddenLayer.exitWeights
            for (let j = 0; j < hiddens; j++) {
              train.hiddenLayer.hiddenLayer[j].calculatedNet(train.layerEntries, train.hiddenLayer.exitWeights,j)
              switch (exitType) {
                case 1: train.hiddenLayer.hiddenLayer[j].linear()
                  break
                case 2: train.hiddenLayer.hiddenLayer[j].logistic()
                  break
                default: train.hiddenLayer.hiddenLayer[j].hiperbolic()
                  break
              }
            }
            for (let k = 0; k < hiddens; k++) { hiddenVet.push(train.hiddenLayer.hiddenLayer[k].obtained) }
            for (let j = 0; j < exit; j++) {
              train.exitLayer[k].calculatedNet(hiddenVet, train.hiddenLayer.exitWeights,j)
              switch (exitType) {
                case 1: train.hiddenLayer.hiddenLayer[j].linear()
                  break
                case 2: train.hiddenLayer.hiddenLayer[j].logistic()
                  break
                default: train.hiddenLayer.hiddenLayer[j].hiperbolic()
                  break
              }
              train.exitLayer[j].calculatedExitError(desiredM[j][desiredExit])
            }
            for (let k = 0; k < exit; k++) { exitErrors.push(train.exitLayer[k].error) }
            for (let k = 0; k < hiddens; k++) { train.hiddenLayer.hiddenLayer[k].calculatedHiddenError(exitErrors, train.hiddenLayer.exitWeights,k) }
            train.hiddenLayer.correctExitWeight(rateLearning, exitErrors)
            train.hiddenLayer.correctWeightsHidden(rateLearning, train.layersEntries)
            train.calculatedNetworkError()
            lineError = train.networkError
            iterationError += lineError
            hiddenWeights = train.hiddenLayer.hiddenWeights
            exitWeights = train.hiddenLayer.exitWeights
            hiddenMatrix = hiddenWeights
            exitMatrix = exitWeights
          }
          count++
        }
        iterationError = iterationError / (matrixTest.length - 1)
        if ((i + 1) % 10 === 0) { iterationE.push([]) }// FAZER A CLASSE GRAFICO
        else if (iterationError < minError) { iterationE.push([]) }
        i++
      })
    } while (i < nroIterations && iterationError >= minError)
  }
}

// const execute = async (exitType: number, nameFile: string): Promise<any> => {
//   const matrix = await readFile(nameFile)
//   const values = valueResults(matrix)
//   const entries = []
//   const exit = values.length

//   const desiredExit = 0
//   const desiredM = desiredMatrix(matrix,exit,exitType)
//   const matConf = generateMatrix(exit,exit)
//   for
// }

export { readFile, normalize, valueResults, selectedTest, generateLayers, desiredMatrix, executeTest }
