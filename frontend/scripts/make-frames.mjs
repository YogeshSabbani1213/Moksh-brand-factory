import { execFileSync } from 'node:child_process'
import { readdirSync, rmSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const videoPath = path.join(projectRoot, 'public', 'media', 'video', 'intro_mbf.mp4')
const outputDirs = {
  desktop: path.join(projectRoot, 'public', 'frames', 'd'),
  mobile: path.join(projectRoot, 'public', 'frames', 'm'),
}
const megabyte = 1024 * 1024
const sizeLimit = 12 * megabyte

if (!statSync(videoPath, { throwIfNoEntry: false })?.isFile()) {
  throw new Error(`Input video was not found: ${videoPath}`)
}

// Start with clean frame folders so old images cannot inflate the counts.
for (const outputDir of Object.values(outputDirs)) {
  rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })
}

const frameJobs = [
  {
    name: 'Desktop',
    outputDir: outputDirs.desktop,
    args: [
      '-y',
      '-i',
      videoPath,
      '-an',
      '-vf',
      'fps=20,scale=1600:-2',
      '-c:v',
      'libwebp',
      '-quality',
      '70',
      path.join(outputDirs.desktop, '%03d.webp'),
    ],
  },
  {
    name: 'Mobile',
    outputDir: outputDirs.mobile,
    args: [
      '-y',
      '-i',
      videoPath,
      '-an',
      '-vf',
      'fps=12,scale=720:-2',
      '-c:v',
      'libwebp',
      '-quality',
      '70',
      path.join(outputDirs.mobile, '%03d.webp'),
    ],
  },
]

// Run FFmpeg directly so paths and errors are handled safely on Windows.
for (const job of frameJobs) {
  console.log(`\nGenerating ${job.name.toLowerCase()} frames...`)
  execFileSync('ffmpeg', job.args, { cwd: projectRoot, stdio: 'inherit' })
}

const sequences = {}
for (const [name, outputDir] of Object.entries(outputDirs)) {
  const files = readdirSync(outputDir).filter((file) => /\.webp$/i.test(file))
  const totalBytes = files.reduce(
    (total, file) => total + statSync(path.join(outputDir, file)).size,
    0,
  )

  sequences[name] = {
    count: files.length,
    path: name === 'desktop' ? '/frames/d/' : '/frames/m/',
  }

  console.log(
    `${name}: ${files.length} frames, ${(totalBytes / megabyte).toFixed(2)} MB`,
  )
  if (totalBytes > sizeLimit) {
    console.warn(`WARNING: ${name} frames exceed the 12 MB size limit.`)
  }
}

const configPath = path.join(projectRoot, 'src', 'config', 'heroFrames.json')
mkdirSync(path.dirname(configPath), { recursive: true })
writeFileSync(configPath, `${JSON.stringify(sequences, null, 2)}\n`)
console.log(`\nWrote ${path.relative(projectRoot, configPath)}`)
