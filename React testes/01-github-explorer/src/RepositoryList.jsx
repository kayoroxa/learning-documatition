import { RepositoryItem } from './RepositoryItem'

export function RepositoryList() {
  return (
    <section className="repository-list">
      <h1>Lista de Repositórios</h1>
      <ul>
        <RepositoryItem />
        <RepositoryItem />
        <RepositoryItem />
        <RepositoryItem />
      </ul>
    </section>
  )
}
