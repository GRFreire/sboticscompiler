# Exemplo

## Seu código

**src/main.cs**

```cs
using utils;
using debug;

Action loop = () => {
    debug();
    move(100, 100);
};

while(true) loop();
```

**src/utils.cs**

```cs
Action<int> wait = (time) => bc.wait(time);
Action<int, string> print = (line, text) => bc.printLCD(line, text);
Func<int, float> distance = (sensor) => bc.distance(sensor - 1);
Func<int, string> color = (sensor) => bc.returnColor(sensor, 0.55f);
Func<int, float> light = (sensor) => bc.lightness(sensor - 1);
Action<float, float> move = (left, right) => bc.onTF(right, left);
Action stop = () => move(0, 0);
```

**src/debug.cs**

```cs
Action debug = () =>
{
    bc.printLCD(1, light(5) + " | " + light(4) + " | " +  light(3) + " | " + light(2)+ " | " + light(1));
    bc.printLCD(2, color(1) + " | " + color(2) + " | " +  color(3) + " | " + color(4)+ " | " + color(5));
    bc.printLCD(3, distance(0).ToString() + " | " + distance(2).ToString() + " | " + distance(3).ToString());
};
```

Digitando `sboticscompiler compile`:

```log
Successfully compiled!
Check out/main.cs to see your changes.
```

## Código final

**out/main.cs**

```cs
/*
nome-do-seu-projeto  1.0.0
By: Autor
License: MIT
---
Compiled with sboticscompiler
https://github.com/GRFreire/sboticscompiler
*/

// SBC------- utils
Action<int> wait = (time) => bc.wait(time);
Action<int, string> print = (line, text) => bc.printLCD(line, text);
Func<int, float> distance = (sensor) => bc.distance(sensor - 1);
Func<int, string> color = (sensor) => bc.returnColor(sensor, 0.55f);
Func<int, float> light = (sensor) => bc.lightness(sensor - 1);
Action<float, float> move = (left, right) => bc.onTF(right, left);
Action stop = () => move(0, 0);

// SBC-------------

// SBC------- debug
Action debug = () =>
{
    bc.printLCD(1, light(5) + " | " + light(4) + " | " +  light(3) + " | " + light(2)+ " | " + light(1));
    bc.printLCD(2, color(1) + " | " + color(2) + " | " +  color(3) + " | " + color(4)+ " | " + color(5));
    bc.printLCD(3, distance(0).ToString() + " | " + distance(2).ToString() + " | " + distance(3).ToString());
};

// SBC-------------


Action loop = () => {
    debug();
    move(100, 100);
};

while(true) loop();
```
