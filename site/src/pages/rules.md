---
sidebar: false
---

<script setup>
import { onMounted, onUnmounted } from 'vue'

// Highlights the heading when the hash matches so it's easier to find
// what it's pointing to
onMounted(() => {
  highlightHeading(window.location.hash, true)
  window.addEventListener('hashchange', handleHashChange)
})

onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange)
})

function handleHashChange(e) {
  highlightHeading(e.oldURL, false)
  highlightHeading(e.newURL, true)
}

function highlightHeading(hash, active) {
  hash = hash.replace(/^.*?#/, '')
  if (!hash) return
  const heading = document.getElementById(hash)
  if (!heading) return
  if (active) {
    heading.classList.add('active')
  } else {
    heading.classList.remove('active')
  }
}
</script>

# Rules

Below is an unordered list of rules used by `publint` for linting.

<!--
  NOTE: Each rule heading should specify the anchor again specifically as VitePress
  will replace the `_` as `-`. This is kinda ugly for now, but in the future, each
  rule will have better dedicated pages and we can rename them.
-->

## `IMPLICIT_INDEX_JS_INVALID_FORMAT` {#implicit_index_js_invalid_format}

If there are no entrypoints specified, e.g. via the `"main"`, `"module"`, and `"exports"` fields, it's assumed that the root `index.js` is the default entrypoint (if it exists). If the file has an invalid format, the error is reported.

An invalid format is defined as whether it has correct [ESM](https://nodejs.org/api/esm.html) or [CJS](https://nodejs.org/docs/latest/api/modules.html) usage. If a code is written in ESM or CJS, it doesn't mean that it would be interpreted as ESM or CJS respectively. In brief, it's dictated by:

- If the file extension is `.mjs`, or if the closest `package.json` has `"type": "module"`, it's interpreted as ESM.
- If the file extension is `.cjs`, or if the closest `package.json` does not have `"type": "module"`, it's interpreted as CJS.

`publint` will check these two behaviour if the file will be interpreted correctly.

## `FILE_INVALID_FORMAT` {#file_invalid_format}

If the file has an invalid format through explicit entrypoints, e.g. the `"main"`, `"module"`, and `"exports"` fields, the error is reported.

Invalid format checks are the same as [above](#implicit_index_js_invalid_format).

## `FILE_INVALID_EXPLICIT_FORMAT` {#file_invalid_explicit_format}

If the file has an invalid format through explicit entrypoints, e.g. the `"main"`, `"module"`, and `"exports"` fields, **and** the file has an explicit extension, e.g. `.mjs` and `.cjs`, the error is reported.

Invalid format checks are the same as [above](#implicit_index_js_invalid_format), except scoped down for explicit extensions for better error messages.

## `FILE_INVALID_JSX_EXTENSION` {#file_invalid_jsx_extension}

JSX extensions such as `.cjsx`, `.mjsx`, `.ctsx`, and `.mtsx` are invalid and are usually mistaken as ESM and CJS variants of JSX. Many tooling don't support these extensions by default. Instead they should be written in plain ESM using the `.jsx` extension.

## `FILE_DOES_NOT_EXIST` {#file_does_not_exist}

The specified file does not exist.

> NOTE: This triggers for all `@types/*` packages `"main"` field because it [sets an empty string](https://github.com/microsoft/DefinitelyTyped-tools/blob/b9601d3b849eafcb802d040cb8200eeeabae0028/packages/publisher/src/generate-packages.ts#L133). It's unclear whether it's intentional, but it should be safe to remove and not affect anything in practice. Keeping it may be confusing or misleading.

## `FILE_NOT_PUBLISHED` {#file_not_published}

The specified file exists locally but isn't published to npm. This error only appears when running `publint` locally.

## `MODULE_SHOULD_BE_ESM` {#module_should_be_esm}

The `module` field should be ESM only as per convention.

## `HAS_MODULE_BUT_NO_EXPORTS` {#has_module_but_no_exports}

If the package has a `"module"` field, but has no `"exports"` field, suggest to use `"exports"` instead. This is because Node.js doesn't recognize the `"module"` field, so instead using `"exports"` would increase compatibility with it.

If the package isn't meant for Node.js usage, it is safe to ignore this suggestion, but it is still recommended to use `"exports"` whenever possible.

## `HAS_ESM_MAIN_BUT_NO_EXPORTS` {#has_esm_main_but_no_exports}

If the `"main"` field is in ESM, but there's no `"exports"` field, it's recommended to use the `"exports"` field instead as it's initially introduced for better ESM compatibility.

If you're not supporting Node.js 12.6 and below, you can also remove the `"main"` field as all tooling would read from `"exports"` only and skip `"main"`.

## `EXPORTS_GLOB_NO_MATCHED_FILES` {#exports_glob_no_matched_files}

If the `"exports"` field contains glob paths, but it doesn't match any files, report this issue.

(Works similarly to [IMPORTS_GLOB_NO_MATCHED_FILES](#imports_glob_no_matched_files)).

## `EXPORTS_GLOB_NO_DEPRECATED_SUBPATH_MAPPING` {#exports_glob_no_deprecated_subpath_mapping}

The `"exports"` field should not have globs defined with trailing slashes. It is [removed since Node.js 17](https://nodejs.org/docs/latest-v22.x/api/deprecations.html#dep0148-folder-mappings-in-exports-trailing-) and should use [subpath patterns](https://nodejs.org/api/packages.html#subpath-patterns), e.g. a trailing `/*` instead.

## `EXPORTS_MODULE_SHOULD_PRECEDE_REQUIRE` {#exports_module_should_precede_require}

Ensure the `"module"` condition comes before the `"require"` condition. Due to the way conditions are matched top-to-bottom, the `"module"` condition (used in bundler contexts only) must come before a `"require"` condition, so it has the opportunity to take precedence.

(Works similarly to [IMPORTS_MODULE_SHOULD_PRECEDE_REQUIRE](#imports_module_should_precede_require)).

## `EXPORTS_TYPES_SHOULD_BE_FIRST` {#exports_types_should_be_first}

Ensure `"types"` condition to be the first. As `"exports"` conditions are order-sensitive, in order for TypeScript to be able to resolve the types first, the `"types"` condition should be the first condition before any other JS exports. See the [TypeScript docs](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-exports) for more information.

## `TYPES_NOT_EXPORTED` {#types_not_exported}

Since TypeScript 5.0, it has supported the [`"moduleResolution": "bundler"` compiler option](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#moduleresolution-bundler) which has stricter rules on loading types (Additionally also affected by `"node16"` and `nodenext"`, and the [`"resolvePackageJsonExports"` compiler option](https://www.typescriptlang.org/tsconfig#resolvePackageJsonExports)).

When an `"exports"` field is found, only the `"types"` condition declared is respected, or if the resolved JS file has the correct adjacent `.d.ts` file. For example:

- `./dist/index.js` -> `./dist/index.d.ts`
- `./dist/index.mjs` -> `./dist/index.d.mts`
- `./dist/index.cjs` -> `./dist/index.d.cts`.

The root `"types"` field is ignored to respect the `"exports"` field module resolution algorithm.

This message may also provide helpful hints depending on the types format, which is explained below.

## `EXPORT_TYPES_INVALID_FORMAT` {#export_types_invalid_format}

Renamed to [EXPORTS_TYPES_INVALID_FORMAT](#exports_types_invalid_format).

## `EXPORTS_TYPES_INVALID_FORMAT` {#exports_types_invalid_format}

Since TypeScript 5.0, it has emphasized that type files (`*.d.ts`) are also affected by its ESM and CJS context, and both contexts affect how the exported types is interpreted. This means that you can't share a single type file for both ESM and CJS exports of your library. You need to have two type files (albeit largely similar contents) when dual-publishing your library.

When specifying the `"types"` conditions in the `"exports"` field, the types format is determined via its extension or its closest `package.json` `"type"` value, similar to the rule in [`IMPLICIT_INDEX_JS_INVALID_FORMAT`](#implicit_index_js_invalid_format). In short:

- If the file ends with `.d.mts`, or if it's `.d.ts` and the closest `package.json` has `"type": "module"`, it's interpreted as ESM.
- If the file ends with `.d.cjs`, or if it's `.d.ts` and the closest `package.json` does not have `"type": "module"`, it's interpreted as CJS.

This rule is inspired from https://arethetypeswrong.github.io which has a more in-depth explanation. If you get a message of:

1. `... types is interpreted as CJS ...`: see [Masquerading as CJS](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md).
2. `... types is interpreted as ESM ...`: see [Masquerading as ESM](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseESM.md).

An example of a correct configuration looks like this:

```json
{
  "exports": {
    "import": {
      "types": "./index.d.mts",
      "default": "./index.mjs"
    },
    "require": {
      "types": "./index.d.cts",
      "default": "./index.cjs"
    }
  }
}
```

## `EXPORTS_DEFAULT_SHOULD_BE_LAST` {#exports_default_should_be_last}

Ensure `"default"` condition to be the last according to the [Node.js docs](https://nodejs.org/api/packages.html#conditional-exports), but it's also because the `"exports"` field is order-based.

The example [above](#exports_types_should_be_first) also applies here as to why it should be last.

(Works similarly to [IMPORTS_DEFAULT_SHOULD_BE_LAST](#imports_default_should_be_last)).

## `EXPORTS_MODULE_SHOULD_BE_ESM` {#exports_module_should_be_esm}

The `"module"` condition should be ESM only. This condition is used to prevent the [dual package hazard](https://nodejs.org/api/packages.html#dual-package-hazard) in bundlers so `import` and `require` will both resolve to this condition, deduplicating the dual instances. The [esbuild docs](https://esbuild.github.io/api/#how-conditions-work) has a more in-depth explanation.

(Works similarly to [IMPORTS_MODULE_SHOULD_BE_ESM](#imports_module_should_be_esm)).

## `EXPORTS_VALUE_INVALID` {#exports_value_invalid}

The `"exports"` field value should always start with a `./`. It does not support omitted relative paths like `"subpath/index.js"`.

(Works similarly to [IMPORTS_VALUE_INVALID](#imports_value_invalid)).

## `EXPORTS_MISSING_ROOT_ENTRYPOINT` {#exports_missing_root_entrypoint}

When a library has the `"main"`, `"module"`, or similar root entrypoint fields, and it also defines the `"exports"` field, the `"exports"` value should also export the root entrypoint as when it's defined, it will always take the highest priority over the other fields, including `"main"` and `"module"`.

## `EXPORTS_VALUE_CONFLICTS_WITH_BROWSER` {#exports_value_conflicts_with_browser}

When an `"exports"` value resolved with a browser-ish condition matches a key in the `"browser"` field object, this means the `"exports"` value is overridden by that matching `"browser"` key. This may cause build issues as the intended `"exports"` value is no longer used. For example, given this setup:

```json
{
  "browser": {
    "./lib.server.js": "./lib.browser.js"
  },
  "exports": {
    ".": {
      "worker": "./lib.server.js",
      "browser": "./lib.browser.js",
      "default": "./lib.server.js"
    }
  }
}
```

When matching the `"worker"` condition, it will resolve to `"./lib.server.js"` which is intended to work in a worker environment. However, the `"browser"` field also has a matching mapping for `"./lib.server.js"`, causing the final resolved path to be `"./lib.browser.js"`.

This is usually not intended and causes the wrong file to be loaded. If it is intended, the `"worker"` condition should point to `"./lib.browser.js"` directly instead.

To fix this, you can rename `"./lib.server.js"` to `"./lib.worker.js"` for example so it has its own specific file. Or check out the [USE_EXPORTS_OR_IMPORTS_BROWSER](#use_exports_or_imports_browser) rule to refactor away the `"browser"` field.

## `EXPORTS_FALLBACK_ARRAY_USE` {#exports_fallback_array_use}

The use of fallback array feature is not recommended. It currently does not have a use case in Node.js, and most tooling will only pick the first value that can be parsed. Other tooling may also work differently leading to inconsistent behaviors.

Related issues: [nodejs/node#37928](https://github.com/nodejs/node/issues/37928), [vitejs/vite#4439](https://github.com/vitejs/vite/issues/4439), [microsoft/TypeScript#50762](https://github.com/microsoft/TypeScript/issues/50762), [webpack/enhanced-resolve#400](https://github.com/webpack/enhanced-resolve/issues/400), [evanw/esbuild#2974](https://github.com/evanw/esbuild/issues/2974), [web-infra-dev/rspack#5052](https://github.com/web-infra-dev/rspack/issues/5052)

(Works similarly to [IMPORTS_FALLBACK_ARRAY_USE](#imports_fallback_array_use)).

## `USE_EXPORTS_BROWSER` {#use_exports_browser}

A `"browser"` field with a string value works similarly to the `"exports"` `"browser"` condition, to define the browser-specific exports of a package. Between the two, it's usually better to use the `"exports"` field instead as it's standardized, widely supported, and keeps one true way of defining your package entrypoints.

## `USE_EXPORTS_OR_IMPORTS_BROWSER` {#use_exports_or_imports_browser}

The `"browser"` field with an object value works similarly to the `"exports"`/`"imports"` `"browser"` condition, to define the browser-specific exports of a package. Between the two, it's usually better to use the `"exports"`/`"imports"` field instead as it's standardized, widely supported, and keeps one true way of defining your package entrypoints.

For example, the following `"browser"` field can be converted like below.

Before:

```json
{
  "browser": {
    "module-a": "./shims/module-a.js",
    "module-b": false,
    "./server/only.js": "./shims/client-only.js"
  }
}
```

After:

```json
{
  "imports": {
    "#module-a": {
      "browser": "./shims/module-a.js",
      "default": "module-a"
    },
    "#module-b": {
      "browser": "./empty.js",
      "default": "module-b"
    },
    "#server-only.js": {
      "browser": "./shims/client-only.js",
      "default": "./server/only.js"
    }
  }
}
```

Note that you'll need to change all imports to use the specifier defined in the `"imports"` field. For example, `import foo from "module-a"` -> `import foo from "#module-a"`.

Depending on your setup, you can also use the `"exports"` field to directly export the browser-specific entrypoint. For example:

```json
{
  "exports": {
    ".": {
      "browser": "./lib.browser.js",
      "default": "./lib.js"
    }
  }
}
```

## `USE_FILES` {#use_files}

Internal tests or config files are published, which are usually not needed and unused. You can use the [`"files"` field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files) to only publish certain files. For example:

```json
{
  "files": ["src", "index.js", "index.d.ts"]
}
```

## `USE_TYPE` {#use_type}

[Module syntax detection](https://nodejs.org/api/packages.html#determining-module-system) attempts to detect ESM syntax, and re-run as an ES module when no `"type"` field is present. It was enabled by default in [Node.js v20.19.0](https://nodejs.org/en/blog/release/v20.19.0) and [Node.js v22.7.0](https://nodejs.org/en/blog/release/v22.7.0). Detection increases startup time for ES modules, so Node is encouraging everyone — especially package authors — to add a type field to `package.json`, even for the default `"type": "commonjs"`.

## `USE_LICENSE` {#use_license}

A license file is published but the `"license"` field is not set in `package.json`. Consider adding a `"license"` field so that it's correctly displayed on npm and allows other tooling to parse the package license.

## `FIELD_INVALID_VALUE_TYPE` {#field_invalid_value_type}

Some `package.json` fields has a set of allowed types, e.g. `string` or `object` only. If an invalid type is passed, this error message will be showed.

## `DEPRECATED_FIELD_JSNEXT` {#deprecated_field_jsnext}

The `"jsnext:main"` and `"jsnext"` fields are deprecated. The `"module"` field should be used instead. See [this issue](https://github.com/jsforum/jsforum/issues/5) for more information.

## `INVALID_REPOSITORY_VALUE` {#invalid_repository_value}

`publint` is able to detect some cases where the `"repository"` field is not a valid and may not properly display on https://npmjs.com. The sub-rules below are mostly based on the [`"repository"` field docs](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#repository).

- If `"repository"` is a string, it must be one of the supported shorthand strings from the docs.
- If `"repository"` is an object with `"type": "git"`, the `"url"` must be a valid [git URL](https://git-scm.com/docs/git-clone#_git_urls) and can be [parsed by npm](https://github.com/npm/hosted-git-info).
- The `git://` protocol for GitHub repos should not be used due [security concerns](https://github.blog/security/application-security/improving-git-protocol-security-github/).
- GitHub or GitLab links should be prefixed with `git+` and postfixed with `.git`. (This is also warned by npm when publishing a package).

An example config that meets these criteria may look like this:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/org/repo.git"
  }
}
```

## `LOCAL_DEPENDENCY` {#local_dependency}

When a dependency with the `file:` or `link:` protocol is used, e.g. `file:../path/to/local/package`, this error is shown as it's likely to not work when installed by end-users. This helps prevent accidentally publishing a package that references local dependencies that were used for testing or debugging.

## `BIN_FILE_NOT_EXECUTABLE` {#bin_file_not_executable}

Ensure the file referenced in the `"bin"` field starts with a shebang, e.g. `#!/usr/bin/env node`, so that the script is executable. See [package.json#bin](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#bin) for more information.

For example, the bin file should look like this:

```js
#!/usr/bin/env node

console.log('CLI is running')
```

## `IMPORTS_GLOB_NO_DEPRECATED_SUBPATH_MAPPING` {#imports_glob_no_deprecated_subpath_mapping}

The `"imports"` field should not have globs defined with trailing slashes. It is [deprecated](https://nodejs.org/docs/latest-v16.x/api/packages.html#subpath-folder-mappings) and should use [subpath patterns](https://nodejs.org/api/packages.html#subpath-patterns), e.g. a trailing `/*` instead.

## `IMPORTS_KEY_INVALID` {#imports_key_invalid}

The keys of the `"imports"` field object should always start with a `#`.

## `IMPORTS_VALUE_INVALID` {#imports_value_invalid}

If the `"imports"` field value does not map to an external dependency, it should always start with a `./`. It does not support omitted relative paths like `"subpath/index.js"`.

(Works similarly to [EXPORTS_VALUE_INVALID](#exports_value_invalid)).

## `IMPORTS_GLOB_NO_MATCHED_FILES` {#imports_glob_no_matched_files}

If the `"imports"` field contains glob paths, but it doesn't match any files, report this issue.

(Works similarly to [EXPORTS_GLOB_NO_MATCHED_FILES](#exports_glob_no_matched_files)).

## `IMPORTS_DEFAULT_SHOULD_BE_LAST` {#imports_default_should_be_last}

Ensure `"default"` condition to be the last according to the [Node.js docs](https://nodejs.org/api/packages.html#conditional-exports), but it's also because the `"imports"` field is order-based.

(Works similarly to [EXPORTS_DEFAULT_SHOULD_BE_LAST](#exports_default_should_be_last)).

## `IMPORTS_MODULE_SHOULD_PRECEDE_REQUIRE` {#imports_module_should_precede_require}

Ensure the `"module"` condition comes before the `"require"` condition. Due to the way conditions are matched top-to-bottom, the `"module"` condition (used in bundler contexts only) must come before a `"require"` condition, so it has the opportunity to take precedence.

(Works similarly to [EXPORTS_MODULE_SHOULD_PRECEDE_REQUIRE](#exports_module_should_precede_require)).

## `IMPORTS_MODULE_SHOULD_BE_ESM` {#imports_module_should_be_esm}

The `"module"` condition should be ESM only. This condition is used to prevent the [dual package hazard](https://nodejs.org/api/packages.html#dual-package-hazard) in bundlers so `import` and `require` will both resolve to this condition, deduplicating the dual instances. The [esbuild docs](https://esbuild.github.io/api/#how-conditions-work) has a more in-depth explanation.

(Works similarly to [EXPORTS_MODULE_SHOULD_BE_ESM](#exports_module_should_be_esm)).

## `IMPORTS_FALLBACK_ARRAY_USE` {#imports_fallback_array_use}

The use of fallback array feature is not recommended. It currently does not have a use case in Node.js, and most tooling will only pick the first value that can be parsed. Other tooling may also work differently leading to inconsistent behaviors.

Related issues: [nodejs/node#37928](https://github.com/nodejs/node/issues/37928), [vitejs/vite#4439](https://github.com/vitejs/vite/issues/4439), [microsoft/TypeScript#50762](https://github.com/microsoft/TypeScript/issues/50762), [webpack/enhanced-resolve#400](https://github.com/webpack/enhanced-resolve/issues/400), [evanw/esbuild#2974](https://github.com/evanw/esbuild/issues/2974), [web-infra-dev/rspack#5052](https://github.com/web-infra-dev/rspack/issues/5052)

(Works similarly to [EXPORTS_FALLBACK_ARRAY_USE](#exports_fallback_array_use)).
