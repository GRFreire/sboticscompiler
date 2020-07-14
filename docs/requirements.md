# Requirements

**To install sboticscompiler, you need to have installed:**
- Node and npm: https://nodejs.org/en/

---

**For checking for errors on compiling, you need to have installed:**
- (optional) Dotnet: https://dotnet.microsoft.com/

If you start a new sbproj (``sboticscompiler init``) without dotnet installed, when compiling your code (``sboticscompiler compile``) sboticscompiler will not check for errors.


Installing dotnet after you started a sbproj, will require you to change the ``checkForErrors`` property to ``true`` on your ``sbproj.json``.