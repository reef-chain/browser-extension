To build extension use
```linux debian```
```node v18.16.0```
```yarn v3.2.1```
run:

```yarn install```
```yarn build```

extension files are then located under
```packages/extension/build```

Since resulting .js file is greater than 4MB we use webpack chunking to split files inside ./extension-js dir
