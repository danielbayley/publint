export default {
  'package.json': JSON.stringify({
    name: 'publint-invalid-repository-value-object-not-git-url',
    version: '0.0.1',
    private: true,
    type: 'commonjs',
    repository: {
      type: 'git',
      url: 'imap://fake.com/',
    },
  }),
}
