#!/usr/bin/node
const convertor = require('./lib/converter')
const { Command } = require('commander')
const fs = require('fs')
const path = require('path')
const program = new Command()
program.version('0.0.1')
program.option('-f, --file <input>', 'sets file to parse')
program.option('-o, --output <output>', 'location to write output to. If not set, output will go to console')
program.option('-s, --safe', 'causes the application to always return 0 regardless of whether tests failed or not')
program.parse(process.argv)

const writeToFile = data => {
  const outputPath = program.opts().output
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, data)

}

const exitProcess = results => {
  if (program.opts().safe) {
    process.exit(0)
  } else {
    process.exit(results.hasFailures() ? 1 : 0)
  }
}

if (process.stdin.isTTY) {
  if (program.opts().file) {
    const data = fs.readFileSync(program.opts().file, 'utf-8')
    let result = convertor.parse(data)
    if (program.opts().output) {
      writeToFile(result.toXml())
    } else {
      console.log(result.toXml())
    }
    exitProcess(result)
  }
} else {
  if (program.opts().file) {
    console.log('file input can\'t be set when data being piped')
    process.exit(2)
  }
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  let data = ''
  rl.on('line', function(line){
    data += line + '\n'
  })
  rl.on('close', function() {
    let result = convertor.parse(data)
    if (program.opts().output) {
      writeToFile(result.toXml())
    } else {
      console.log(result.toXml())
    }
    exitProcess(result)
  })
}
