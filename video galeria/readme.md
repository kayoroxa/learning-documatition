**README - Funcionalidades do Botão**

### Funções do Botão no Elemento Vídeo:

- **Botão Esquerdo (Clique Comum):**

  - **Função:** Salva um recorte do vídeo atual com duração de **10 segundos**.
  - **Comportamento:**
    - O vídeo será cortado a partir de um ponto aleatório calculado.
    - O arquivo gerado será salvo no diretório configurado no servidor.

- **Botão do Meio (Clique do Scroll):**

  - **Função:** Salva e **abre a pasta** com o arquivo do recorte gerado.
  - **Comportamento:**
    - O vídeo será cortado da mesma forma que o clique esquerdo.
    - A pasta onde o arquivo foi salvo será aberta automaticamente no explorador de arquivos.

- **Botão Direito (Clique com o Menu Contextual):**
  - **Função:** Carrega um **novo vídeo aleatório** para o elemento clicado.
  - **Comportamento:**
    - Uma nova solicitação é feita ao servidor para buscar outro vídeo.
    - O vídeo carregado será exibido no mesmo elemento, com um ponto de início e duração de 10 segundos.

---

### Observações Importantes:

- **Recortes de vídeo** têm uma duração fixa de **10 segundos**.
- A pasta de salvamento é definida no servidor (ver `server.js`).
- Certifique-se de que o servidor está configurado corretamente e que os vídeos estão localizados no diretório especificado.

---
