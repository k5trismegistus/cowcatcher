import * as PDFJS from 'pdfjs-dist'
PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

export const readFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export const loadPdf = async (file) => {
  const slidePdfData = await readFileAsync(file)
  const pdf = await PDFJS.getDocument({
    data: slidePdfData,
    cMapUrl: '/cmaps/',
    cMapPacked: true
  }).promise

  return pdf
}

export const downloadFile = (url, filename) => {
  const a = document.createElement("a")
  document.body.appendChild(a)
  a.style = "display: none"
  a.href = url
  a.download = "download.webm"
  a.click(url)
  window.URL.revokeObjectURL(url)
}