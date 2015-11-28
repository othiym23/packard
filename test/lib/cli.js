var nixt = require('nixt')

function pnixt () {
  return nixt()
           .env('packard_roots', '')
           .env('packard_loglevel', 'info')
           .env('packard_staging-directory', '')
           .env('packard_archive__root', '')
           .env('packard_archive__enabled-by-default', '')
           .env('packard_archive__glob-pattern', '')
           .env('packard_playlist', '')
}

module.exports = {
  pnixt: pnixt
}
