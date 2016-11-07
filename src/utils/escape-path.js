export default function escapePath (path) {
  return path.replace(/ /g, '\\ ')
}
