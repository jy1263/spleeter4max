const path = require('path')
const Max = require('max-api')
const { exec, execSync } = require('child_process')
const done = () => {
  Max.outlet('spleeterDone')
}

Max.post(`Loaded the ${path.basename(__filename)} script`)
// Docker's default path may not be in Max Node's env path
process.env.PATH = [process.env.PATH, '/usr/local/bin'].join(':')
Max.outlet('bang')

// Use the 'addHandler' function to register a function for a particular
// message
Max.addHandlers({
  onFile: (filename) => {
    if (!filename) {
      Max.post('No audio file found.')
      done()
      return
    }
    runSpleeter(filename)
  }
})

const showDir = (dir) => {
  // Since LOM has no way to load these files automatically into new tracks,
  // just open a file dialog and let the user drag-and-drop them.
  let opener
  if (process.platform === 'darwin') {
    opener = 'open'
  } else if (process.platform === 'win32') {
    opener = 'start ""'
  } else {
    Max.post(`Unsupported platform: ${process.platform}`)
  }
  execSync(`${opener} "${dir}"`)
  Max.outlet('set', `Select a clip; then press the button to start.`)
}

<<<<<<< Updated upstream
const runSpleeter = (filename) => {
  const cmd = `spleeter separate -i "${filename}" -o "${__dirname}" -p spleeter:4stems-16kHz`
=======
const runSpleeter = async (filename) => {
  const dict = await Max.getDict('main')
  var fidelity = ''
  if (dict.fidelity != 'normal') {
    fidelity = dict.fidelity
  } 

  const cmd = `spleeter separate -o "${__dirname}" -p spleeter:${dict.model}${fidelity} "${filename}"`
>>>>>>> Stashed changes
  Max.outlet('set', `Spleeter is running. This may take a minute...`)
  Max.post(cmd)

  // Calls the spleeter python process
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      Max.outlet('set', `Error: ${err.message}`)
      Max.post(`Error: ${err.message}`)
      Max.post(`Spleeter stderr: ${stderr}`)
      Max.post(`Spleeter stdout: ${stdout}`)
      done()
      return
    }
    if (stderr) {
      Max.post(`Spleeter stderr: ${stderr}`)
    }
    if (stdout) {
      Max.post(`Spleeter stdout: ${stdout}`)
    }
    const correctFilename = path.basename(filename).split('.').slice(0, -1).join('.')
    const outputFilename = path.join(__dirname, correctFilename)
    showDir(outputFilename)
    done()
  })
}
