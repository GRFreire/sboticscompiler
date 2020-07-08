# Requisitos

**Para instalar o sboticscompiler, você precisa ter instalado:**
- Node e npm: https://nodejs.org/en/

---

**For checking for errors on compiling, você precisa ter instalado:**
- (opcional) Dotnet: https://dotnet.microsoft.com/

Se você iniciar um novo sbproj (``sboticscompiler init``) sem o dotnet instalado, ao compilar seu código (``sboticscompiler compile``), o sboticscompiler não procurará por erros.


A instalação do dotnet após o início de um sbproj exigirá que você altere a propriedade ``checkForErros`` para ``true`` no seu ``sbproj.json``.