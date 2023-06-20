# beautify-tracejs
Make the javascript stack trace of error more friendly and readable with colorful and code snippet.

## How to use
### Install
```npm install beautify-tracejs```

### Example usage
``` 
beautify = require('beautify-tracejs');
beautify.register();

let err = new Error("test");
console.log(err.stack);

beautify.unregister();


```

## How it works
V8 engine in nodejs provides the Error.prepareStackTrace api to allow us customizing the stack trace of an error.

This library will hook into this api add more features into the stack trace string:
- Add a code snippet directly into stack trace --> in case logging into file, a code snippet can help sysadmin easily detect and troubleshoot problem.
- Add colorful string into console log console.log(err.stack) --> this will help developers quickly see the problem.


My project is inspired from other projects. I also borrow the source code and ideas from these projects. 

These projects are no longer actively developed. I want to add more features in future to help Javascript developer.

- https://pypi.org/project/pretty-traceback/
- https://github.com/mjpizz/better-stack-traces
- https://github.com/vitaly-t/manakin
- https://github.com/shinnn/neat-stack

## Result
```javascript
Error: Stack trace before beautify-tracejs register
    at Context.<anonymous> (/Users/stefanlee/projects/beautify-tracejs/test/index.test.js:8:21)
    at callFn (/Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runnable.js:366:21)
    at Runnable.run (/Users/stefanlee/projects/beautify-tracejs/Waiting for the debugger to disconnect...
node_modules/mocha/lib/runnable.js:354:5)
    at Runner.runTest (/Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:666:10)
    at /Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:789:12
    at next (/Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:581:14)
    at /Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:591:7
    at next (/Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:474:14)
    at Immediate._onImmediate (/Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:559:5)
    at process.processImmediate (node:internal/timers:478:21)
    at process.callbackTrampoline (node:internal/async_hooks:130:17)
```

```javascript
Error: Stack trace after beautify-tracejs register
    at Context.<anonymous> (/Users/stefanlee/projects/beautify-tracejs/test/index.test.js:13:19)
    ────────────────────────────────────────────────────────────────────────────────────────────────────────────
    10 »         beautify.register()
    11 » 
    12 »         let randomStr = "ThatTrackSourceCode"
    13 »         let err = new Error("Stack trace after beautify-tracejs register");
    ••••••••••••••••••••••••
    14 » 
    15 »         console.log(err)
    16 » 

    at /Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runnable.js:366:21
    at Test.run (/Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runnable.js:354:5)
    at Runner.runTest (/Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:666:10)
    at /Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:789:12
    at /Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:581:14
    at /Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:591:7
    at /Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:474:14
    at Immediate._onImmediate (/Users/stefanlee/projects/beautify-tracejs/node_modules/mocha/lib/runner.js:559:5)
    at process.<anonymous> (node:internal/timers:478:21)
    at process.<anonymous> (node:internal/async_hooks:130:17)
```
