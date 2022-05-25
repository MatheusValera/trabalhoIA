export class Graph {
  private readonly networkError
  private readonly iteration

  constructor (error: number, iteration: number) {
    this.networkError = error
    this.iteration = iteration
  }
}
