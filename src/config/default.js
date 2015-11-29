import log from 'npmlog'
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
      'root': undefined
    },
    playlist: undefined
  },
  [] // don't want rc interpreting argv
)

log.setGaugeTemplate([
  {type: 'name', separated: true, maxLength: 40, minLength: 40, align: 'left'},
  {type: 'spinner', separated: true},
  {type: 'startgroup'},
  {type: 'completionbar'},
  {type: 'endgroup'}
])
log.gauge.setTheme({
  startgroup: '╢',
  endgroup: '╟',
  complete: '█',
  incomplete: '░',
  spinner: '◴◷◶◵',
  subsection: '→'
})

// Babel object export doesn't do hoisting, so leave this here
export default config
