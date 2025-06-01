import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PDFDocument, StandardFonts, rgb, PageSizes, BlendMode } from 'pdf-lib'
import download from 'downloadjs'
import logo from '../assets/logo.png'
import { useEndPoints } from '@/composables/useEndPoints'

const { apiBase } = useEndPoints()

export const useBoletatxt = defineStore('boletatxt', () => {
  const text = ref('')
  const cab = ref({})
  const det = ref([])
  const idliq = ref(0)

  async function setId(id) {
    idliq.value = id

    try {
      const resp1 = await fetch(`${apiBase.value}/api/view/boletaCabPie?IdLiq=${idliq.value}`)

      cab.value = await resp1.json()

      const resp = await fetch(`${apiBase.value}/api/view/boletaDetalle?IdLiq=${idliq.value}`)

      det.value = await resp.json()
    } catch (error) {
      console.log(error)
    }
  }

  async function createBoleta() {
    console.log(cab.value)
    console.log(det.value)

    let text = '\n\n\n'
    text += cab.value[0]['C1'] + '\n'
    text += cab.value[0]['C2'] + '\n'
    text += cab.value[0]['C3'] + '\n'
    text += cab.value[0]['C4'] + '\n'
    text += cab.value[0]['C5'] + '\n'

    text = text + '\n ' + '-'.padStart(96, '-')

    text =
      text +
      '\nCod Subcod  Descripción                      Cant        Vto            Haberes         Retenciones\n\n'

    let textley = ''

    let maxitems = 30

    let acumHab = 0.0
    let acumRet = 0.0
    let acumLey = 0.0

    det.value.forEach((element) => {
      if (element['ESLEY'] == 1) {
        textley = textley + element['CADENA'].replace('  0.00', '      ') + '\n'
        acumLey = acumLey + Number(element['HABERES'])
        maxitems--
      } else {
        text = text + element['CADENA'].replace('  0.00', '      ') + '\n'
        acumHab = acumHab + Number(element['HABERES'])
        acumRet = acumRet + Number(element['RETENCIONES'])
        maxitems--
      }
    })

    let acumNeto = acumHab - acumRet

    while (maxitems > 0) {
      text = text + '\n'
      maxitems--
    }

    text = text + '\n' + textley

    text = text + '\n\n ' + '-'.padStart(96, '-')

    text =
      text +
      `\n${acumHab.toFixed(2).toString().padStart(79)}${acumRet.toFixed(2).toString().padStart(19)}
                      '\nSup. Gobierno de Tucumán  30-67542808-1' + '\n'
                      \n${'LIQUIDO: '.toString().padStart(78)} ${acumNeto.toFixed(2).toString().padStart(19)}                      
                      \n\n\n Recibo Nro. ${idliq.value}`

    //console.log(textley)

    const textByline = text.toString().split('\n')

    const pdfDoc = await PDFDocument.create()
    const fontCur = await pdfDoc.embedFont(StandardFonts.Courier)
    const fontBold = await pdfDoc.embedFont(StandardFonts.CourierBold)

    const page = pdfDoc.addPage([595.28, 841.89])
    const { width, height } = page.getSize()

    // Image

    const pngUrl = logo

    const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer())

    const pngImage = await pdfDoc.embedPng(pngImageBytes)

    const pngDims = pngImage.scale(0.4)

    page.drawImage(pngImage, {
      x: page.getWidth() / 2 - pngDims.width / 2,
      y: (page.getHeight() - 20) / 2 - pngDims.height / 2 + 200,
      width: pngDims.width,
      height: pngDims.height,
      opacity: 0.3
    })

    let fontSize = 8
    let font = fontCur
    for (let index = 0; index < textByline.length; index++) {
      const element = textByline[index]
      page.drawText(element, {
        x: 20,
        y: height - (index + 1) * fontSize,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0)
      })
      /*
            page.drawText(element, {
                x: width / 2 + 20,
                y: height - (index + 1) * fontSize,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0)
            })
                */
    }

    page.drawText('ORIGINAL', {
      x: width / 2 - 75,
      y: height - fontSize - 10,
      size: 9,
      font: fontBold,
      color: rgb(0, 0, 0)
    })

    page.drawLine({
      start: { x: width / 2, y: 0 },
      end: { x: width / 2, y: height },
      thickness: 0.5,
      color: rgb(0.75, 0.2, 0.2),
      opacity: 0.15
    })

    const pdfBytes = await pdfDoc.save()
    //await pdfDoc.saveAsBase64({})
    //const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true })
    download(pdfBytes, cab.value[0]['FILENAME'], 'application/pdf')
    //return pdfBytes
  }

  async function createPdf() {
    let cadenacab = ''
    let cadenapie = ''
    let cadenaley = ''
    let filename = ''
    let idLiq = 0

    if ((cab.value.length = 1 && cab.value.length > 0)) {
      const line = cab.value[0]

      cadenacab += line['C1'] + '\n'
      cadenacab += line['C2'] + '\n'
      cadenacab += line['C3'] + '\n'
      cadenacab += line['C4'] + '\n'
      cadenacab += line['C5'] + '\n'

      idLiq = line['IDLIQ']
      cadenapie += 'Sup. Gobierno de Tucumán  30-67542808-1' + '\n'

      filename = line['FILENAME']
    }

    let cadenadet =
      'Cod Subcod  Descripción                      Cant        Vto            Haberes         Retenciones\n\n'

    let hab = 0
    let ret = 0
    let ley = 0

    if (det.value && det.value.length > 0) {
      det.value.forEach((element) => {
        if (element['ESLEY'] == 1) {
          cadenaley += element['CADENA'].replace('  0.00', '      ') + '\n'
          ley += element['HABERES']
        } else {
          cadenadet += element['CADENA'].replace('  0.00', '      ') + '\n'
          hab += element['HABERES']
          ret += element['RETENCIONES']
        }
      })

      cadenadet +=  '\n' + cadenaley

      const liquid = hab - ret

      cadenapie += Number.parseFloat(hab).toFixed(2).toLocaleString().padStart(79)
      cadenapie += Number.parseFloat(ret).toFixed(2).toLocaleString().padStart(19) + '\n\n'
      cadenapie += 'LIQUIDO: '.toString().padStart(79) + Number.parseFloat(liquid).toFixed(2).toLocaleString().padStart(19) + '\n'

      cadenapie += '\nRECIBO NRO: '.padStart(77) + idLiq

      const text = cadenacab + '\n' + cadenadet + '\n' + cadenaley + '\n' + cadenapie

      const textByline = text.toString().split('\n')

      const textCab = cadenacab.toString().split('\n')
      const textDet = cadenadet.toString().split('\n')
      const textPie = cadenapie.toString().split('\n')

      const pdfDoc = await PDFDocument.create()
      const fontCur = await pdfDoc.embedFont(StandardFonts.Courier)
      const fontBold = await pdfDoc.embedFont(StandardFonts.CourierBold)

      const page = pdfDoc.addPage(PageSizes.A4)
      const { width, height } = page.getSize()

      // Image

      const pngUrl = logo

      const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer())

      const pngImage = await pdfDoc.embedPng(pngImageBytes)

      const pngDims = pngImage.scale(0.2)

      page.drawImage(pngImage, {
        x: page.getWidth() / 2 - pngDims.width / 2,
        y: (page.getHeight() - 20) / 2 - pngDims.height / 2 + 145,
        width: pngDims.width,
        height: pngDims.height,
        opacity: 0.2,
        blendMode: BlendMode.SoftLight
      })

      let fontSize = 9
      let font = fontCur

      let xpos = 30
      let ypos = 25
      let tempHeight = height
      font = fontBold

      for (let index = 0; index < textCab.length; index++) {
        const element = textCab[index]

        ypos = tempHeight - 25 - index * fontSize

        page.drawText(element, {
          x: xpos,
          y: ypos,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0)
        })
      }

      page.drawLine({
        start: { x: xpos, y: ypos },
        end: { x: width - xpos, y: ypos },
        thickness: 1,
        //color: rgb(0.75, 0.2, 0.2),
        opacity: 0.5
      })

      tempHeight = ypos

      for (let index = 0; index < textDet.length; index++) {
        const element = textDet[index]

        font = fontCur
        ypos = tempHeight - index - 25 - index * fontSize

        page.drawText(element, {
          x: xpos,
          y: ypos,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0)
        })
      }

      tempHeight = ypos

      for (let index = 0; index < 40 - textDet.length; index++) {
        ypos = tempHeight - index - 25 - index * fontSize
      }

      page.drawLine({
        start: { x: xpos, y: ypos },
        end: { x: width - xpos, y: ypos },
        thickness: 1,
        //color: rgb(0.75, 0.2, 0.2),
        opacity: 0.5
      })

      tempHeight = ypos

      for (let index = 0; index < textPie.length; index++) {
        const element = textPie[index]

        font = fontCur
        ypos = tempHeight - index - 25 - index * fontSize

        page.drawText(element, {
          x: xpos,
          y: ypos,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0)
        })
      }

      tempHeight = ypos

      const pdfBytes = await pdfDoc.save()
      //await pdfDoc.saveAsBase64({})
      //const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true })
      download(pdfBytes, cab.value[0]['FILENAME'], 'application/pdf')
      //return pdfBytes
    }
  }
  return { text, setId, cab, det, createPdf, createBoleta }
})
