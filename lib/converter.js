const { create } = require('xmlbuilder2')

const createTestSuite = suiteName => ({
  id: suiteName,
  name: suiteName,
  tests: 0,
  failures: 0,
  skipped: 0,
  errors: 0,
  time: 0,
  testcases: []
})

const createTestcase = rego => {
  return {
    classname: rego.location.file,
    name: rego.name,
    time: rego.duration,
    failure: rego.fail ? `${rego.location.file}:${rego.location.row}` : undefined,
    error: rego.error
  }
}

module.exports.parse = str => {
  const data = JSON.parse(str)
  const testSuites = {

    testSuites: [],
    failures: 0,
    skipped: 0,
    errors: 0,
    tests: 0,
    time: 0
  }
  const getTestSuite = suiteName => {
    let r = testSuites.testSuites.filter(v => v.id === suiteName)
    let suite = r[0]
    if (suite === undefined) {
      suite = createTestSuite(suiteName)
      testSuites.testSuites.push(suite)
    }
    return suite
  }

  data.forEach(v => {
    let testSuite = getTestSuite(v.package)
    const testCase = createTestcase(v)
    testSuites.time += v.duration
    testSuite.time += v.duration
    ++testSuites.tests
    ++testSuite.tests
    if (v.fail) {
      ++testSuite.failures
      ++testSuites.failures
    }
    testSuite.testcases.push(testCase)
  })

  return {
    hasFailures: () => testSuites.failures > 0,
    toXml: () => {
      let root = create({ version: '1.0' })
      let testSuiteEle = root.ele('testsuites', { 
        tests: testSuites.tests,
        failures: testSuites.failures,
        skipped: testSuites.skipped,
        errors: testSuites.errors,
        time: parseFloat((testSuites.time / 1000000000).toFixed(3))
      })
      testSuites.testSuites.forEach(suite => {
        let suiteEle = testSuiteEle.ele('testsuite', {
          name: suite.name,
          tests: suite.tests,
          failures: suite.failures,
          skipped: suite.skipped,
          errors: suite.errors,
          time: parseFloat((suite.time / 1000000000).toFixed(3))
        })
        suite.testcases.forEach(test => {
          let testEle = suiteEle.ele('testcase', {
            name: test.name,
            time: test.time,
            classname: test.classname,
            time: parseFloat((test.time / 1000000000).toFixed(3))
          })
          if (test.failure) {
            testEle.ele('failure', { message: test.failure})
          }
          if (test.error) {
            testEle.ele('error', {
              type: test.error.code,
              message: `${test.error.message} (${test.error.location.file}:${test.error.location.row})`
            })
          }
        })
      })
      return root.end({ prettyPrint: true })
    }
  }
}