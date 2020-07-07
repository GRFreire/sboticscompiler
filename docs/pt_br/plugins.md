# Guia de plugin para o sboticscompiler

Os plugins permitem adicionar recursos ao sboticscompiler, como comandos e
extensões ao objeto `toolbox` que fornece a maioria das funcionalidades
usado pelo sboticscompiler.

Criar um plugin sboticscompiler é fácil. Basta criar um repositório com duas pastas:

```
commands/
extensions/
```

Um comando é um arquivo se parece com isso:

```js
// commands/foo.js

module.exports = {
  run: (toolbox) => {
    const { print, filesystem } = toolbox

    const desktopDirectories = filesystem.subdirectories(`~/Desktop`)
    print.info(desktopDirectories)
  }
}
```

Uma extensão permite adicionar recursos adicionais à `toolbox`.

```js
// extensions/bar-extension.js

module.exports = (toolbox) => {
  const { print } = toolbox

  toolbox.bar = () => { print.info('Bar!') }
}
```

Isto é então acessível nos comandos do seu plugin como `toolbox.bar`.

# Carregando um plugin

Para carregar um plugin específico (que deve começar com `sboticscompiler- *`),
instale-o no seu projeto usando `npm install --save-dev sboticscompiler-PLUGINNAME`,
e o sboticscompiler irá buscá-lo automaticamente.
