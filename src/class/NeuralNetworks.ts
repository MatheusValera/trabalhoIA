/* eslint-disable @typescript-eslint/brace-style */
import fs from 'fs'
import { Training } from '../class/Training'
import { HiddenLayer } from '../class/HiddenLayer'
import { Neuron } from '../class/Neuron'
import { Graph } from '../class/Graph'

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
  const entry: number = list[0].length - 1
  const entries = []
  const exit: number = valueResults(list).length

  for (const line in list) {
    const auxTraining: Training = new Training()
    for (const column in list[line]) {
      entries[column] = list[line][column]
    }
    auxTraining.layersEntries = entries
    training.push(auxTraining)
  }

  return { training, entry, exit, hiddens: (entry + exit) / 2 }
}

const desiredMatrix = (exit: number, selected: number): any => {
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

const executeTest = async (nameFile: string, minError: number, nroIterations: number, rateLearning: number, exitType: number): Promise<any> => {
  const matrixTest = await readFile(nameFile)
  const { training, entries, exit, hidden } = generateLayers(matrixTest)

  let hiddenWeights = []
  let exitWeights = []
  let desiredExit = 0
  let iterationError = -10000
  let lineError = 0
  const iterationE = []
  const values = valueResults(matrixTest)
  const desiredM = desiredMatrix(exit, exitType)
  const hiddenFinalWeights = []
  const exitFinalWeights = []
  const hiddenVet = []
  const exitErrors = []

  if (matrixTest) {
    let hiddenMatrix = generateMatrix(hidden, entries)
    let exitMatrix = generateMatrix(exit,hidden)

    let weight = 1
    training.forEach((train) => {
      train.hiddenLayer = new HiddenLayer(entries,hidden,exit)
      train.exitLayer = []
      for (let i = 0; i < train.exitLayer; i++) { train.exitLayer.push(new Neuron()) }
      train.hiddenLayer.generatedWeight(entries,exit)
      weight++
    })
    console.log(weight)
    for (let i = 0; i < exit; i++) {
      hiddenFinalWeights.push(hiddenMatrix)
      exitFinalWeights.push(exitMatrix)
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
            hiddenFinalWeights[desiredExit] = train.hiddenLayer.hiddenWeights
            exitFinalWeights[desiredExit] = train.hiddenLayer.exitWeights
            for (let j = 0; j < hidden; j++) {
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
            for (let k = 0; k < hidden; k++) { hiddenVet.push(train.hiddenLayer.hiddenLayer[k].obtained) }
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
            for (let k = 0; k < hidden; k++) { train.hiddenLayer.hiddenLayer[k].calculatedHiddenError(exitErrors, train.hiddenLayer.exitWeights,k) }
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
        if ((i + 1) % 10 === 0) { iterationE.push([new Graph(iterationError, i + 1)]) }
        else if (iterationError < minError) { iterationE.push([new Graph(iterationError, i + 1)]) }
        i++
      })
    } while (i < nroIterations && iterationError >= minError)

    return { training, hiddenFinalWeights, exitFinalWeights, hiddenWeights, exitWeights, dataGraph: iterationE }
  }
}

const execute = async (nameFile: string, minError: number, nroIterations: number, rateLearning: number, exitType: number): Promise<any> => {
  const matrix = await readFile(nameFile)
  const { training, hiddenFinalWeights, exitFinalWeights } = await executeTest('base_treinamento.csv',minError,nroIterations,rateLearning,exitType)
  let desiredExit = 0
  const values = valueResults(matrix)
  const exit = values.length
  const matConf = generateMatrix(exit,exit)
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const hiddens = (matrix[0].length + exit) / 2
  training.forEach((train) => {
    train.hiddenLayer = new HiddenLayer(matrix[0].length,hiddens,exit)
    train.exitLayer = []
    for (let i = 0; i < exit; i++) { train.exitLayer.push(new Neuron()) }
  })
  let count = 0
  training.forEach((train) => {
    if (count !== matrix.length - 1) {
      const index = matrix[count][matrix[0].length - 1]
      for (let i = 0; i < exit; i++) {
        if (index === values[i])
        {
          desiredExit = i
          i = exit
        }
      }
      train.hiddenLayer.hiddenWeights = hiddenFinalWeights[desiredExit]
      train.hiddenLayer.exitWeights = exitFinalWeights[desiredExit]
      const hiddenVet = []
      const obtainedVet = []
      for (let i = 0; i < hiddens; i++) {
        train.hiddenLayer.hiddenLayer[i].calculatedNet(train.layersEntries, train.hiddenLayer.hiddenWeights,i)
        switch (exitType) {
          case 1: train.hiddenLayer.hiddenLayer[i].linear()
            break
          case 2: train.hiddenLayer.hiddenLayer[i].logistic()
            break
          default: train.hiddenLayer.hiddenLayer[i].hiperbolic()
            break
        }
      }
      for (let i = 0; i < hiddens; i++) {
        hiddenVet.push(train.hiddenLayer.hiddenLayer[i].obtained)
      }
      for (let i = 0; i < exit; i++) {
        train.exitLayer[i].calculatedNet(hiddenVet, train.hiddenLayer.exitWeights,i)
        switch (exitType) {
          case 1: train.exitLayer[i].linear()
            break
          case 2: train.exitLayer[i].logistic()
            break
          default: train.exitLayer[i].hiperbolic()
            break
        }
        obtainedVet.push(train.exitLayer[i].obtained)
      }
      let bigger = obtainedVet[0]
      let posBigger = 0
      for (let i = 0; i < exit; i++)
      {
        if (bigger < obtainedVet[i])
        {
          bigger = obtainedVet[i]
          posBigger = i
        }
      }
      matConf[posBigger][desiredExit]++
      count++
    }
  })
  const vet: number[] = []
  for (let i = 0; i < exit; i++) { vet.push(0) }
  for (let i = 0; i < matrix.length - 1; i++) {
    const index = matrix[i][matrix[0].length - 1]
    for (let j = 0; j < exit; j++) {
      if (index === valueResults[j])
      {
        desiredExit = j
        vet[desiredExit]++
      }
    }
  }
  let sum1 = 0; let sum2 = 0
  const tags = []
  for (let i = 0; i < exit; i++) {
    const value: number = matConf[i][i]
    sum1 += value
    sum2 += vet[i]
  }

  const hits = sum1 * 100 / sum2
  tags.push({ option: `Acertos: ${hits}`, value: hits })
  if (100 - hits !== 0)
  { tags.push({ option: `Acertos: ${hits}`, value: 100 - hits }) }
}

export { normalize, valueResults, selectedTest, generateLayers, desiredMatrix, executeTest,execute }
