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