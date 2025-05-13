import { ROOT_FOLDER_KEY, FOLDER_QUERY_PARAM } from './constants.js'
import { FOLDERS_URL } from './urls.js'
import { logStep } from './logger.js'

export function createFolderButtons(loadVideos, currentSlug, callback) {
  const container = document.getElementById('folderButtons')
  if (!container) {
    logStep('folders', '❌ Não encontrou #folderButtons no DOM', 'error')
    return
  }

  fetch(FOLDERS_URL)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data.folders)) {
        logStep('folders', '❌ Resposta inválida do backend', 'error')
        logStep('folders', data, 'error')
        return
      }

      const folders = [ROOT_FOLDER_KEY, ...data.folders]
      container.innerHTML = ''

      let resolvedFolderName = ROOT_FOLDER_KEY

      // 🧠 Transforma slug em nome real
      const slugToName = (slug) => {
        const raw = slug.replaceAll('-', ' ').toLowerCase()
        return folders.find(f => f.toLowerCase() === raw) || slug
      }

      resolvedFolderName = slugToName(currentSlug)

      folders.forEach(folder => {
        if (!folder) {
          logStep('folders', '⚠️ Nome de pasta inválido', 'warn')
          return
        }

        const btn = document.createElement('button')
        btn.textContent = folder
        btn.className =
          'px-3 py-1 rounded bg-gray-700 hover:bg-blue-600 transition text-sm'

        if (folder.toLowerCase() === resolvedFolderName.toLowerCase()) {
          btn.classList.add('active-folder')
        }

        btn.addEventListener('click', () => {
          const url = new URL(window.location)
          const folderSlug = folder.replaceAll(' ', '-')
          url.searchParams.set(FOLDER_QUERY_PARAM, folderSlug)
          window.history.replaceState(null, '', url)

          document.body.dataset.currentFolder = folder
          createFolderButtons(loadVideos, folderSlug)
          loadVideos(folder)

          logStep('folders', `📁 Botão clicado: ${folder}`, 'info')
        })

        container.appendChild(btn)
      })

      if (typeof callback === 'function') {
        callback(resolvedFolderName)
      }
    })
    .catch(err => {
      logStep('folders', '❌ Erro ao carregar pastas', 'error')
      logStep('folders', err.message, 'error')
    })
}
