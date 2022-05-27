import { execute } from '../class/NeuralNetworks'
import 'source-map-support'

const main = async (): Promise<void> => {
  await execute('base_teste.csv',0.0001,5,0.2,1)
  console.log('terminou')
}

const result = main()
console.log(result)
