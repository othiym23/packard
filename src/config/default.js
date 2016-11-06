import rc from 'rc'

const config = rc(
  'packard',
  {
    loglevel: 'info',
    roots: undefined,
    'staging-directory': undefined,
    archive: {
      'enabled-by-default': false,
      'glob-pattern': undefined,
      root: undefined
    },
    transcode: {
      encoder: 'lame',
      profile: '-V0'
    },
    playlist: undefined
  },
  [] // don't want rc interpreting argv
)

// Babel object export doesn't do hoisting, so leave this here
export default config
