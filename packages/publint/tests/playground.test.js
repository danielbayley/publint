import path from 'node:path'
import { test } from 'vitest'
import { createFixture } from 'fs-fixture'
import { publint } from '../src/index-node.js'
import { formatMessage } from '../src/utils.js'

const isWindowsCI = process.env.CI !== undefined && process.platform === 'win32'

testFixture('exports-browser-conflict', [
  'EXPORTS_VALUE_CONFLICTS_WITH_BROWSER',
  'USE_EXPORTS_OR_IMPORTS_BROWSER',
])

testFixture('exports-styles', [
  'EXPORTS_FALLBACK_ARRAY_USE',
  'EXPORTS_FALLBACK_ARRAY_USE',
  'EXPORTS_VALUE_INVALID',
  'FILE_DOES_NOT_EXIST',
  'FILE_DOES_NOT_EXIST',
  'FILE_INVALID_FORMAT',
  'FILE_INVALID_FORMAT',
])

testFixture('glob', [])

testFixture('glob-deprecated', [
  'EXPORTS_GLOB_NO_DEPRECATED_SUBPATH_MAPPING',
  'EXPORTS_GLOB_NO_MATCHED_FILES',
  'IMPORTS_GLOB_NO_DEPRECATED_SUBPATH_MAPPING',
  'IMPORTS_GLOB_NO_MATCHED_FILES',
])

testFixture('invalid-field-types', [
  'FIELD_INVALID_VALUE_TYPE',
  'FIELD_INVALID_VALUE_TYPE',
  'FIELD_INVALID_VALUE_TYPE',
  'FIELD_INVALID_VALUE_TYPE',
  'FIELD_INVALID_VALUE_TYPE',
])

testFixture('invalid-jsx-extensions', [
  ...Array(4).fill('FILE_INVALID_JSX_EXTENSION'),
])

testFixture('missing-files', [
  ...Array(8).fill('FILE_DOES_NOT_EXIST'),
  'FILE_NOT_PUBLISHED',
  'USE_EXPORTS_OR_IMPORTS_BROWSER',
])

testFixture('missing-license', ['USE_LICENSE'])

testFixture('no-exports-module', [])

testFixture('not-missing-files', [])

testFixture('exports-module', ['EXPORTS_MODULE_SHOULD_PRECEDE_REQUIRE'])

testFixture('exports-custom-condition', [])

testFixture('publish-config', ['FILE_DOES_NOT_EXIST', 'USE_EXPORTS_BROWSER'])

testFixture('npmignore', [])

testFixture('test-1', [
  'FILE_INVALID_FORMAT',
  'LOCAL_DEPENDENCY',
  'LOCAL_DEPENDENCY',
  'TYPES_NOT_EXPORTED',
  'USE_FILES',
])

testFixture('test-2', [
  'EXPORTS_GLOB_NO_DEPRECATED_SUBPATH_MAPPING',
  'EXPORTS_MISSING_ROOT_ENTRYPOINT',
  'EXPORTS_MODULE_SHOULD_BE_ESM',
  'EXPORTS_VALUE_INVALID',
  'FILE_DOES_NOT_EXIST',
  'FILE_INVALID_FORMAT',
  'FILE_INVALID_FORMAT',
  'USE_EXPORTS_BROWSER',
])

testFixture(
  'test-2 (level: warning)',
  [
    'EXPORTS_MISSING_ROOT_ENTRYPOINT',
    'EXPORTS_MODULE_SHOULD_BE_ESM',
    'EXPORTS_VALUE_INVALID',
    'FILE_DOES_NOT_EXIST',
    'FILE_INVALID_FORMAT',
    'FILE_INVALID_FORMAT',
  ],
  { level: 'warning' },
)

testFixture(
  'test-2 (level: error)',
  [
    'EXPORTS_MODULE_SHOULD_BE_ESM',
    'EXPORTS_VALUE_INVALID',
    'FILE_DOES_NOT_EXIST',
  ],
  { level: 'error' },
)

testFixture(
  'test-2 (strict: true)',
  [
    'EXPORTS_MISSING_ROOT_ENTRYPOINT',
    'EXPORTS_MODULE_SHOULD_BE_ESM',
    'EXPORTS_VALUE_INVALID',
    'FILE_DOES_NOT_EXIST',
    'FILE_INVALID_FORMAT',
    'FILE_INVALID_FORMAT',
  ],
  { level: 'error', strict: true },
)

testFixture(
  'test-2 (strict: true)',
  [
    { code: 'EXPORTS_GLOB_NO_DEPRECATED_SUBPATH_MAPPING', type: 'suggestion' },
    { code: 'EXPORTS_MISSING_ROOT_ENTRYPOINT', type: 'error' },
    { code: 'EXPORTS_MODULE_SHOULD_BE_ESM', type: 'error' },
    { code: 'EXPORTS_VALUE_INVALID', type: 'error' },
    { code: 'FILE_DOES_NOT_EXIST', type: 'error' },
    { code: 'FILE_INVALID_FORMAT', type: 'error' },
    { code: 'FILE_INVALID_FORMAT', type: 'error' },
    { code: 'USE_EXPORTS_BROWSER', type: 'suggestion' },
  ],
  { strict: true },
)

testFixture('types', ['TYPES_NOT_EXPORTED'])

testFixture('types-exports-resolution', [])

testFixture('types-exports-resolution-cjs', [])

testFixture('types-exports-resolution-cjs-explicit', [
  'EXPORTS_TYPES_INVALID_FORMAT',
])

testFixture('types-exports-resolution-dual', [
  'TYPES_NOT_EXPORTED',
  'TYPES_NOT_EXPORTED',
])

testFixture('types-exports-resolution-dual-explicit', [
  'EXPORTS_TYPES_INVALID_FORMAT',
])

testFixture('types-exports-resolution-custom-conditions', [
  'EXPORTS_TYPES_INVALID_FORMAT',
  'EXPORTS_TYPES_INVALID_FORMAT',
])

testFixture('types-exports-versioned', [])

testFixture('types-versions', [])

testFixture('umd', ['FILE_INVALID_FORMAT', 'FILE_INVALID_FORMAT'])

testFixture('deprecated-fields', [
  'DEPRECATED_FIELD_JSNEXT',
  'DEPRECATED_FIELD_JSNEXT',
  'USE_TYPE',
])

testFixture('invalid-repository-value-string-not-url', [
  {
    code: 'INVALID_REPOSITORY_VALUE',
    type: 'warning',
  },
])

testFixture('invalid-repository-value-shorthand', [])

testFixture('invalid-repository-value-shorthand-nested', [])

testFixture('invalid-repository-value-object-not-git-url', [
  {
    code: 'INVALID_REPOSITORY_VALUE',
    type: 'warning',
  },
])

testFixture('invalid-repository-value-object-shorthand-site', [
  {
    code: 'INVALID_REPOSITORY_VALUE',
    type: 'suggestion',
  },
])

testFixture('invalid-repository-value-object-deprecated', [
  {
    code: 'INVALID_REPOSITORY_VALUE',
    type: 'suggestion',
  },
])

testFixture('bin-file-missing-shebang', ['BIN_FILE_NOT_EXECUTABLE'])

testFixture('bin-file-not-lintable', [])

testFixture('imports-external-package', [])

testFixture('imports-field-invalid', ['IMPORTS_KEY_INVALID'])

/**
 * @typedef {{
 *  level?: import('../src/index.d.ts').Options['level']
 *  strict?: import('../src/index.d.ts').Options['strict']
 *  debug?: boolean
 * }} TestOptions
 */

/**
 * @param {string} name
 * @param {import('../src/index.d.ts').Message['code'][] | Pick<import('../src/index.d.ts').Message, 'code' | 'type'>[]} expectCodes
 * @param {TestOptions} [options]
 */
function testFixture(name, expectCodes, options) {
  /** @type {import('vitest').TestOptions} */
  const testOpts = { concurrent: true, timeout: process.env.CI ? 8000 : 5000 }

  test(name, testOpts, async ({ expect }) => {
    const fixtureName = name.replace(/\(.*$/, '').trim() + '.js'
    const fixtureDir = path.resolve(process.cwd(), 'tests/fixtures')
    const fixturePath = path.resolve(fixtureDir, fixtureName)
    const fixtureContent = (await import(fixturePath)).default
    const fixture = await createFixture(fixtureContent, {
      // For some reason, fs-fixture writes files to the system temporary directory
      // very slowly on GitHub actions Windows CI. Writing to somewhere else in the
      // project is much faster.
      tempDir: isWindowsCI ? fixtureDir : undefined,
    })

    try {
      const { messages } = await publint({
        pkgDir: fixture.path,
        level: options?.level,
        strict: options?.strict,
      })

      // unfortunately the messages are not always in order as checks are ran in parallel,
      // here we sort it to make the tests more consistent
      messages.sort((a, b) => a.code.localeCompare(b.code))

      if (options?.debug) {
        const pkg = JSON.parse(await fixture.readFile('package.json', 'utf-8'))
        console.log()
        console.log('Logs:', name)
        messages.forEach((m) => console.log(formatMessage(m, pkg)))
        console.log()
      }

      // you can test an array of objects
      if (typeof expectCodes[0] === 'object') {
        const codes = messages.map((v) => ({ code: v.code, type: v.type }))
        expect(codes).toEqual(expectCodes)
      } else {
        const codes = messages.map((v) => v.code)
        expect(codes).toEqual(expectCodes)
      }
    } finally {
      await fixture.rm()
    }
  })
}
