# Example

## Your code

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
using utils;

Action debug = () =>
{
    bc.printLCD(1, 5.ToString() + " | " + 4.ToString() + " | " +  3.ToString() + " | " + 2.ToString()+ " | " + 1.ToString());
    bc.printLCD(2, "COL1" + " | " + "COL2" + " | " +  "COL3" + " | " + "COL4"+ " | " + "COL5");
    bc.printLCD(3, "DIST1" + " | " + "DIST2" + " | " + "DIST3");
};
```

Typing ``sboticscompiler compile``:
```log
Successfully compiled!
Check out/main.cs to see your changes.
```

## Final code

**out/main.cs**
```cs
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
    bc.printLCD(1, 5.ToString() + " | " + 4.ToString() + " | " +  3.ToString() + " | " + 2.ToString()+ " | " + 1.ToString());
    bc.printLCD(2, "COL1" + " | " + "COL2" + " | " +  "COL3" + " | " + "COL4"+ " | " + "COL5");
    bc.printLCD(3, "DIST1" + " | " + "DIST2" + " | " + "DIST3");
};
// SBC-------------


Action loop = () => {
    debug();
    move(200, 200);
};

while(true) loop();
```