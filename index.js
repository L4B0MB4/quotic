const jimp = require("jimp");
const path = require("path");

const config = require("./quotic.json");

// Landscape photos are not yet supported
if (config.imageWidth > config.imageHeight) {
  const temp = config.imageWidth;
  config.imageWidth = config.imageHeight;
  config.imageHeight = temp;
}

const centerHalfHeight = Math.abs((config.imageWidth - config.imageHeight) / 2);
const centerHalfWidth = Math.abs((config.imageHeight - config.imageWidth) / 2);

const args = process.argv;

if (args.length < 4) {
  console.log("Please provide your title and citation as commandline arguments");
  console.log("node index.js 'my title' 'my quote'");
  return;
} else {
  start(args[2], args[3]);
}

async function start(title, quote) {
  const fontLarge = await jimp.loadFont(path.join(__dirname, "assets/font.fnt"));
  let foreground = await jimp.read(config.inputFile);
  await foreground.resize(config.imageWidth, config.imageWidth);
  let background = await foreground.clone();
  background = await handleBackground(background);
  foreground = await handleForeground(foreground);
  background.composite(foreground, 0, centerHalfHeight);
  await background.brightness(config.brightness);
  await background.gaussian(config.gaussianTogether);
  await addQuotationAndTitle(background, fontLarge, title, quote);
  background.write(path.join(config.outputDir, title.replace(/ /g, "").toLowerCase() + "_" + quote.replace(/ /g, "").toLowerCase() + ".png"));
}

async function addQuotationAndTitle(background, fontLarge, title, quote) {
  await background.print(
    fontLarge,
    0,
    0,
    {
      text: quote,
      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
    },
    config.imageWidth,
    config.imageHeight
  );

  await background.print(
    fontLarge,
    0,
    config.imageHeight - 100,
    {
      text: title,
      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
    },
    config.imageWidth,
    100
  );
}

async function handleBackground(image) {
  image.resize(config.imageHeight, config.imageHeight);
  image.crop(centerHalfWidth, 0, config.imageWidth, config.imageHeight);
  return image;
}
async function handleForeground(image) {
  await image.gaussian(config.gaussianTogether);
  return image;
}
