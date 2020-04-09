const PDFDocument = require("pdf-lib").PDFDocument
const StandardFonts = require("pdf-lib").StandardFonts
const QRCode = require("qrcode")
const fs = require("fs")

const src_pdf = "./blank.pdf"
const dst_pdf = "./certificate.pdf"

process.argv.shift()
process.argv.shift()

if (process.argv.length !== 12) {
    console.log(process.argv.length)
    console.log("usage:")
    console.log('\
        const profile = {\n\
            lastname: "Dupont",\n\
            firstname: "Jean",\n\
            birthday: "01/01/1970",\n\
            lieunaissance: "Lyon",\n\
            address: "999 avenue de france",\n\
            zipcode: "75001",\n\
            town: "Paris",\n\
            datesortie: "01/01/2020",\n\
            heuresortie: "00h00",\n\
            datecreation: "01/01/2020",\n\
            heurecreation: "00h00"\n\
        }\n')
    console.log('reasons = ["travail", "courses", "sante", "famille", "sport", "judiciaire", "missions"]')
    process.exit(1)
}



const profile = {
    lastname: process.argv[0],
    firstname: process.argv[1],
    birthday: process.argv[2],
    lieunaissance: process.argv[3],
    address: process.argv[4],
    zipcode: process.argv[5],
    town: process.argv[6],
    datesortie: process.argv[7],
    heuresortie: process.argv[8],
    datecreation: process.argv[9],
    heurecreation: process.argv[10]
}

reasons = ["travail", "courses", "sante", "famille", "sport", "judiciaire", "missions"]
reason = process.argv[11]
if (reason == undefined)
    reason = 4

generatePdf(profile, reasons[reason]).then((res) => {
    fs.writeFile(dst_pdf, res, (err) => {
        if (err) throw err;
        console.log('Done.');
    });
})

/*
** FUNCS
*/

const generateQR = async text => {
  try {
    var opts = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
    }
    return await QRCode.toDataURL(text, opts)
  } catch (err) {
    console.error(err)
  }
}

function pad (str) {
  return String(str).padStart(2, '0')
}

function setDateNow (date) {
  year = date.getFullYear()
  month = pad(date.getMonth() + 1) // Les mois commencent à 0
  day = pad(date.getDate())
}

function idealFontSize (font, text, maxWidth, minSize, defaultSize) {
  let currentSize = defaultSize
  let textWidth = font.widthOfTextAtSize(text, defaultSize)

  while (textWidth > maxWidth && currentSize > minSize) {
    textWidth = font.widthOfTextAtSize(text, --currentSize)
  }

  return (textWidth > maxWidth) ? null : currentSize
}

async function generatePdf (profile, reasons) {
  /*
  const generatedDate = new Date()
  setDateNow(generatedDate)
  const creationDate = `${day}/${month}/${year}`

  const hour = pad(generatedDate.getHours())
  const minute = pad(generatedDate.getMinutes())
  const creationHour = `${hour}h${minute}`
  */

  const { lastname, firstname, birthday, lieunaissance, address, zipcode, town, datesortie, heuresortie, datecreation, heurecreation } = profile
  creationDate = datecreation
  creationHour = heurecreation
  const releaseHours = String(heuresortie).substring(0, 2)
  const releaseMinutes = String(heuresortie).substring(3, 5)

  const data = [
    `Cree le: ${creationDate} a ${creationHour}`,
    `Nom: ${lastname}`,
    `Prenom: ${firstname}`,
    `Naissance: ${birthday} a ${lieunaissance}`,
    `Adresse: ${address} ${zipcode} ${town}`,
    `Sortie: ${datesortie} a ${releaseHours}h${releaseMinutes}`,
    `Motifs: ${reasons}`,
  ].join('; ')

  const existingPdfBytes = await fs.readFileSync(src_pdf)

  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const page1 = pdfDoc.getPages()[0]

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawText = (text, x, y, size = 11) => {
    page1.drawText(text, { x, y, size, font })
  }

  drawText(`${firstname} ${lastname}`, 123, 686)
  drawText(birthday, 123, 661)
  drawText(lieunaissance, 92, 638)
  drawText(`${address} ${zipcode} ${town}`, 134, 613)

  if (reasons.includes('travail')) {
    drawText('x', 76, 527, 19)
  }
  if (reasons.includes('courses')) {
    drawText('x', 76, 478, 19)
  }
  if (reasons.includes('sante')) {
    drawText('x', 76, 436, 19)
  }
  if (reasons.includes('famille')) {
    drawText('x', 76, 400, 19)
  }
  if (reasons.includes('sport')) {
    drawText('x', 76, 345, 19)
  }
  if (reasons.includes('judiciaire')) {
    drawText('x', 76, 298, 19)
  }
  if (reasons.includes('missions')) {
    drawText('x', 76, 260, 19)
  }
  let locationSize = idealFontSize(font, profile.town, 83, 7, 11)

  if (!locationSize) {
    alert('Le nom de la ville risque de ne pas être affiché correctement en raison de sa longueur. ' +
      'Essayez d\'utiliser des abréviations ("Saint" en "St." par exemple) quand cela est possible.')
    locationSize = 7
  }

  drawText(profile.town, 111, 226, locationSize)

  if (reasons !== '') {
    // Date sortie
    drawText(`${profile.datesortie}`, 92, 200)
    drawText(releaseHours, 200, 201)
    drawText(releaseMinutes, 220, 201)
  }

  // Date création
  drawText('Date de création:', 464, 150, 7)
  drawText(`${creationDate} à ${creationHour}`, 455, 144, 7)

  const generatedQR = await generateQR(data)

  const qrImage = await pdfDoc.embedPng(generatedQR)

  page1.drawImage(qrImage, {
    x: page1.getWidth() - 170,
    y: 155,
    width: 100,
    height: 100,
  })

  pdfDoc.addPage()
  const page2 = pdfDoc.getPages()[1]
  page2.drawImage(qrImage, {
    x: 50,
    y: page2.getHeight() - 350,
    width: 300,
    height: 300,
  })

  const pdfBytes = await pdfDoc.save()

  return pdfBytes
  //return new Blob([pdfBytes], { type: 'application/pdf' })
}