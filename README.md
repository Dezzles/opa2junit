# opa2junit
NodeJS tool for converting OPA test results to JUnit test results

```
opa2junit -f input.json
```

# Usage

```
$ npm install -g opa2junit
```

opa2junit can then be used in a number of different ways. The recommendation for CI/CD processes is to pipe the result in. This will result in the resulting junit file being written to the console.

```
opa test . | opa2junit
```

For CLI options, use the `-h` or `--help` options
```
opa2junit --help
```

To read in from a file rather than the pipe, use the `-f` or `--file` parameters.  **Note that the `-f` parameter takes precedence over pipes**
```
opa2junit --file results.json
```

To write the resulting output to a file rather than the console, use the `-o` or `--output` parameters
```
opa test . | opa2junit --output test-results/test.xml
```

Note that the above parameters can be used together.
```
opa2junit -f results.json -o test-results/test.xml
```

By default, if any tests fail, or error, then opa2junit will return a non-zero return code. This can be disabled by using the `-s` or `--safe` parameters
```
opa2junit -f file-with-errors.json -s
```