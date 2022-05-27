/* eslint-disable @typescript-eslint/brace-style */
import fs from 'fs'
import { Training } from '../class/Training'
import { HiddenLayer } from '../class/HiddenLayer'
import { Neuron } from '../class/Neuron'
import { Graph } from '../class/Graph'

const readFile = async (nameFile: string): Promise<any> => {
  const file = fs.readFileSync('../tests/' + nameFile,'utf-8')
  const list = file.split('\r\n')
  const fileAux = []
  const fileReturn = []
  list.forEach(line => {
    fileAux.push(line.toString().split(','))
  })
  fileAux.forEach(line => {
    fileReturn.push([])
    line.forEach(line => {
      fileReturn[fileReturn.length - 1].push(parseInt(line) ? parseInt(line) : line)
    })
  })
  // console.log('>>>>>> fileReturn: ', fileReturn)
  return fileReturn
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
    value = line[col]
    if (!exitResult.includes(value)) { exitResult.push(value) }
  }
  return exitResult
}

const generateLayers = (file: any, list: any): any => {
  const training: Training[] = []
  const entry: number = file[0].length - 1
  const exit: number = valueResults(file).length - 1

  for (const line in list) {
    const entries = []
    const auxTraining: Training = new Training()
    for (const column in list[line]) {
      entries.push(list[line][column])
    }
    auxTraining.layersEntries = [...entries]
    training.push(auxTraining)
  }
  return { training, entry, exit, hidden: Math.round((entry + exit) / 2) }
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
  const file = await readFile(nameFile)
  const matrixTest = []
  for (let i = 0; i < file.length; i++) {
    if (i >= 1)
    {
      matrixTest.push([])
      for (let j = 0; j < file[i].length - 1; j++) {
        matrixTest[matrixTest.length - 1].push(file[i][j])
      }
    }
  }
  const { training, entry, exit, hidden } = generateLayers(file,matrixTest)
  let hiddenWeights = []
  let exitWeights = []
  let desiredExit = 0
  let iterationError = -10000
  let lineError = 0
  const iterationE = []
  const values = valueResults(file)
  const desiredM = desiredMatrix(exit, exitType)
  const hiddenFinalWeights = []
  const exitFinalWeights = []

  if (matrixTest) {
    let hiddenMatrix = generateMatrix(hidden, entry)
    let exitMatrix = generateMatrix(exit,hidden)

    let weight = 1
    training.forEach((train) => {
      train.hiddenLayer = new HiddenLayer(entry,hidden,exit)
      train.exitLayer = []
      for (let i = 0; i < exit; i++) { train.exitLayer.push(new Neuron()) }
      train.hiddenLayer.generatedWeight(entry,exit)
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
      training.forEach((train,indexA) => {
        if (count !== file.length - 1) {
          const index = file[count][entry]
          for (let k = 0; k < exit; k++) {
            if (index === values[k]) {
              desiredExit = k
              k = exit
            }
            hiddenFinalWeights[desiredExit] = train.hiddenLayer.hiddenWeights
            exitFinalWeights[desiredExit] = train.hiddenLayer.exitWeights
            for (let j = 0; j < hidden; j++) {
              console.log('>>>>>>> ',train.layersEntries,train.hiddenLayer.hiddenWeights)
              train.hiddenLayer.hiddenLayer[j].calculatedNet(train.layersEntries, train.hiddenLayer.hiddenWeights,j)
              console.log('********************************************************')
              switch (exitType) {
                case 1: train.hiddenLayer.hiddenLayer[j].linear()
                  break
                case 2: train.hiddenLayer.hiddenLayer[j].logistic()
                  break
                default: train.hiddenLayer.hiddenLayer[j].hiperbolic()
                  break
              }
              console.log(train.hiddenLayer.hiddenLayer[j])
              console.log('sai ######################################################\n')
            }
            const hiddenVet = []

            for (let k = 0; k < hidden; k++) {
              hiddenVet.push(train.hiddenLayer.hiddenLayer[k].obtained)
              console.log('hiddenVet',hiddenVet)
            }
            for (let j = 0; j < exit; j++) {
              console.log('exitWeights',train.hiddenLayer.exitWeights)
              train.exitLayer[j].calculatedNet(hiddenVet, train.hiddenLayer.exitWeights,j)
              switch (exitType) {
                case 1: train.exitLayer[j].linear()
                  break
                case 2: train.exitLayer[j].logistic()
                  break
                default: train.exitLayer[j].hiperbolic()
                  break
              }
              console.log(train.exitLayer[j])
              console.log('sai ######################################################\n')

              train.exitLayer[j].calculatedExitError(desiredM[j][desiredExit])
              console.log(train.exitLayer[j])
            }
            const exitErrors = []

            for (let k = 0; k < exit; k++) {
              exitErrors.push(train.exitLayer[k].error) }
            console.log('line 204 ',train.hiddenLayer,exitErrors)
            for (let k = 0; k < hidden; k++) { train.hiddenLayer.hiddenLayer[k].calculatedHiddenError(exitErrors, train.hiddenLayer.hiddenWeights,k) }
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
          console.log('//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', indexA)
        }
      })
      iterationError = iterationError / (matrixTest.length - 1)
      console.log(iterationError < minError)
      if ((i + 1) % 10 === 0) { iterationE.push(new Graph(iterationError, i + 1)) }
      else if (iterationError < minError) { iterationE.push(new Graph(iterationError, i + 1)) }
      console.log('lopp test >>>>> ',iterationE)
      // for (let i = 0; i < 10000000000000000000000000000000; i++) {}
      i++
    } while (i < nroIterations && iterationError >= minError)
    console.log('lopp test')
    return { training, hiddenFinalWeights, exitFinalWeights, hiddenWeights, exitWeights, dataGraph: iterationE }
  }
}

const execute = async (nameFile: string, minError: number, nroIterations: number, rateLearning: number, exitType: number): Promise<any> => {
  const file = await readFile(nameFile)
  console.log('............................. EXECUTE ...........................................')
  const matrix = []
  for (let i = 0; i < file.length; i++) {
    if (i >= 1)
    {
      matrix.push([])
      for (let j = 0; j < file[i].length - 1; j++) {
        matrix[matrix.length - 1].push(file[i][j])
      }
    }
  }
  const { training, hiddenFinalWeights, exitFinalWeights } = await executeTest('base_treinamento.csv',minError,nroIterations,rateLearning,exitType)
  let desiredExit = 0
  const values = valueResults(file)
  const exit = values.length - 1
  const matConf = generateMatrix(exit,exit)
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const hiddens = (file[0].length + exit) / 2
  training.forEach((train) => {
    train.hiddenLayer = new HiddenLayer(matrix[0].length,hiddens,exit)
    train.exitLayer = []
    for (let i = 0; i < exit; i++) { train.exitLayer.push(new Neuron()) }
  })
  let count = 0
  training.forEach((train) => {
    console.log('lopp execute')
    if (count !== file.length - 1) {
      const index = file[count][matrix[0].length - 1]
      for (let i = 0; i < exit; i++) {
        if (index === values[i])
        {
          desiredExit = i
          i = exit
        }
      }
      train.hiddenLayer.hiddenWeights = hiddenFinalWeights[desiredExit]
      train.hiddenLayer.exitWeights = exitFinalWeights[desiredExit]
      for (let i = 0; i < hiddens; i++) {
        console.log('pesos >>>>> ',i,train.hiddenLayer.hiddenLayer[i])
        console.log('>>>>>>> ',train.layersEntries,train.hiddenLayer.hiddenWeights)
        train.hiddenLayer.hiddenLayer[i].calculatedNet(train.layersEntries, train.hiddenLayer.hiddenWeights,i)
        console.log('********************************************************')
        switch (exitType) {
          case 1: train.hiddenLayer.hiddenLayer[i].linear()
            break
          case 2: train.hiddenLayer.hiddenLayer[i].logistic()
            break
          default: train.hiddenLayer.hiddenLayer[i].hiperbolic()
            break
        }
        console.log(train.hiddenLayer.hiddenLayer[i])
        console.log('sai ######################################################\n')
      }
      const hiddenVet = []
      for (let i = 0; i < hiddens; i++) {
        hiddenVet.push(train.hiddenLayer.hiddenLayer[i].obtained)
      }

      for (let i = 0; i < exit; i++) {
        console.log('exitWeights',train.hiddenLayer.exitWeights)
        train.exitLayer[i].calculatedNet(hiddenVet, train.hiddenLayer.exitWeights,i)
        switch (exitType) {
          case 1: train.exitLayer[i].linear()
            break
          case 2: train.exitLayer[i].logistic()
            break
          default: train.exitLayer[i].hiperbolic()
            break
        }
        console.log(train.exitLayer[i])
        console.log('sai ######################################################\n')
      }
      const obtainedVet = []
      for (let i = 0; i < exit; i++) {
        hiddenVet.push(train.exitLayer[i].obtained)
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
  console.log('sai')
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
  console.log('RESULTADO >>>> ',tags)
}

export { normalize, valueResults, selectedTest, generateLayers, desiredMatrix, executeTest,execute }
