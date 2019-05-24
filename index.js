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
start(args[2], args[3]);

async function start(title, citation) {
  const fontLarge = await jimp.loadFont(path.join(__dirname, "assets/font.fnt"));
  let res = await jimp.read(config.inputFile);
  await res.resize(config.imageWidth, config.imageWidth);
  let res2 = await res.clone();
  const background = await handleBackground(res2);
  const foreground = await handleForeground(res);
  background.composite(foreground, 0, centerHalfHeight);
  await background.brightness(config.brightness);
  await background.gaussian(config.gaussianTogether);
  await background.print(
    fontLarge,
    0,
    0,
    {
      text: citation,
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
  background.write(config.outputDir + title.replace(/ /g, "").toLowerCase() + ".png");
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
