import { useEffect, useRef, useState } from 'react'
import frameConfig from '../config/heroFrames.json'

export function useFramePreloader(
  mode,
  onProgress,
  enabled = true,
  { batchSize = 8 } = {},
) {
  const framesRef = useRef({
    mode,
    images: new Map(),
    failed: new Set(),
    listeners: new Set(),
  })
  if (framesRef.current.mode !== mode) {
    framesRef.current = {
      mode,
      images: new Map(),
      failed: new Set(),
      listeners: new Set(),
    }
  }

  const [status, setStatus] = useState({
    mode: null,
    progress: 0,
    firstFrameReady: false,
  })
  const progressCallback = useRef(onProgress)
  progressCallback.current = onProgress

  const sequence = frameConfig[mode]
  const currentStatus =
    status.mode === mode
      ? status
      : { mode, progress: 0, firstFrameReady: false }

  useEffect(() => {
    let active = true
    let loadedCount = 0
    let firstFrameReady = !enabled
    let lastProgress = -1
    let lastReportedReady = false
    const pendingImages = new Set()
    const frameSet = framesRef.current
    const totalFrames = sequence.count

    frameSet.images.clear()
    frameSet.failed.clear()
    frameSet.listeners.clear()

    const reportProgress = () => {
      if (!active) return
      const progress = enabled
        ? Math.round((loadedCount / totalFrames) * 100)
        : 100
      if (progress === lastProgress && firstFrameReady === lastReportedReady) {
        return
      }
      const progressChanged = progress !== lastProgress
      lastProgress = progress
      lastReportedReady = firstFrameReady
      setStatus({ mode, progress, firstFrameReady })
      if (progressChanged) {
        progressCallback.current?.(progress)
      }
    }

    if (!enabled) {
      reportProgress()
      return () => {
        active = false
      }
    }

    const loadFrame = (frameNumber, isFirstFrame = false) =>
      new Promise((resolve) => {
        const image = new Image()
        const framePath = `${sequence.path}${String(frameNumber).padStart(3, '0')}.webp`
        pendingImages.add(image)
        image.decoding = 'async'
        image.onload = () => {
          pendingImages.delete(image)
          if (active) {
            frameSet.images.set(frameNumber, image)
            for (const listener of frameSet.listeners) listener()
          }
          if (isFirstFrame) firstFrameReady = true
          loadedCount += 1
          reportProgress()
          resolve()
        }
        image.onerror = () => {
          pendingImages.delete(image)
          if (active) frameSet.failed.add(frameNumber)
          if (isFirstFrame) firstFrameReady = true
          loadedCount += 1
          reportProgress()
          resolve()
        }
        image.src = framePath
      })

    reportProgress(false)

    const preloadFrames = async () => {
      await loadFrame(1, true)
      for (let first = 2; first <= totalFrames && active; first += batchSize) {
        const batch = []
        const end = Math.min(first + batchSize - 1, totalFrames)
        for (let frameNumber = first; frameNumber <= end; frameNumber += 1) {
          batch.push(loadFrame(frameNumber))
        }
        await Promise.all(batch)
      }

      if (active && frameSet.failed.size > 0) {
        console.warn(
          `MBF hero: ${frameSet.failed.size} ${mode} frame(s) failed to load; nearby frames or the poster will be used.`,
        )
      }
    }

    void preloadFrames()

    return () => {
      active = false
      for (const image of pendingImages) {
        image.onload = null
        image.onerror = null
        image.src = 'data:,'
      }
      for (const image of frameSet.images.values()) {
        image.onload = null
        image.onerror = null
      }
      frameSet.images.clear()
      frameSet.failed.clear()
      frameSet.listeners.clear()
    }
  }, [batchSize, enabled, mode, sequence.count, sequence.path])

  return {
    count: sequence.count,
    firstFrameReady: currentStatus.firstFrameReady,
    framesRef,
    path: sequence.path,
    progress: currentStatus.progress,
  }
}
