createServer({
  routes() {
    this.namespace = 'api'

    // handles GET requests to /api/movies
    this.get('/movies', () => ({
      movies: [
        { id: 1, name: 'Inception', year: 2010 },
        { id: 2, name: 'Interstellar', year: 2014 },
        { id: 3, name: 'Dunkirk', year: 2017 },
      ],
    }))

    // resets the namespace to the root
    this.namespace = '' // or this.namespace = "/"
    this.passthrough() // now this will pass through everything not handled to the current domain (e.g. localhost:3000)
  },
})
