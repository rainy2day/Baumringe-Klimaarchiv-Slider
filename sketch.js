let tableData;
let cleanData;
let table;

//Variablen für Vertex Kreis
let scale = 50;
let resolution = 0.0035;
let numPoints = 880;
let numRings = 159;

//Variablen für Animation
let rad = [];
let ringIndex = 0;

//Variable für Slider
let ageSlider;

// Info-Texte für aktuelles Jahr
const currentYear = document.getElementById('current-year'); 
const currentTemp = document.getElementById('current-temperature'); 
const currentHumd = document.getElementById('current-precipitation'); 
// mit z.B. currentYear.innerText kann Inhalt eingefügt werden

function preload() {
  //my table is comma   value "csv"
  //and has a header specifying the columns labels
  tableData = loadTable("data/climate-dta-temp-precipitation-average.csv", "csv", "header");
}

function setup() {
  let canvas = createCanvas(1200, 1200);
  canvas.parent('p5-container');
  noiseSeed(77.7);
  colorMode(HSB);
  strokeWeight(1.5);
  frameRate(25);

  cleanData = tableData.rows.map(function (eintrag, index) {
    const obj = eintrag.obj; // falsch beschriftet
    // const temp = obj.year // Achtung! Es ist ein String
    const temp = parseFloat(obj.year); // macht Zahl aus String
    const hueVal = map(temp, 6, 10.99, 190, 359+20); // Farben über 0 hinaus
    const rad = temp * 0.3 + (index + 1) * 3.5;
    const prec = parseFloat(obj.prec) //Jahresniederschlag

    const newObj = {
      year: parseFloat(obj.time),
      temperature: temp,
      precipitation: prec, 
      hue: hueVal,
      radius: rad,
    }; // neues Objekt richtig benannt

  return newObj; // neues Objekt in neuen Array geschrieben
  }); // generiert neuen Array, ursprüngliche Daten werden nicht verändert
  console.log(cleanData);
  // spätestens ab hier ist die Länge bekannt
  const years = cleanData.length
  ageSlider = createSlider(0, years-1);
  ageSlider.position(40, 50);
  ageSlider.style("width", "1140px");
  ageSlider.id('year-slider')
  ageSlider.parent('age-slider-label')
  ageSlider.addClass('ageSlider');

  // Erstes Mal Infotexte befüllen 
  updateSlider()

  // Slider mit Event-Listener ausrüsten
  ageSlider.changed(updateSlider)
}

function draw() {
  background(100);
  translate(width / 2, height / 2 + 60);
  noFill();

  const age = ageSlider.value();

  cleanData.forEach(function (eintrag, index) {
    // Loop durch die «sauberen» Daten
    const year = eintrag.year;
    const temperature = eintrag.temperature;
    const hue = eintrag.hue;
    const radius = eintrag.radius;
    const precipitation = eintrag.precipitation;
 
    push() // Hier beginnt die Zeichnung der Kreise
    stroke(hue, 100, 100);

    randomSeed(random(58.7, 99)); //hier wird die Bewegung gestoppt

    if (index <= ringIndex) {
      beginShape();
      for (let a = 0; a < TAU; a += TAU / numPoints) {
        let x = cos(a) * radius + precipitation/100;
        let y = sin(a) * radius + precipitation/100;

        let n = map(noise(x * resolution, y * resolution), 0, 1, -scale, scale);

        curveVertex(x + n, y + n);

        if (random() > 0.85 - 0.2 * sin(radius)) {
          endShape();
          beginShape();
        }
      }
      endShape();
    }

  if (ringIndex == numRings-1) { // Baumrinde wird erst beim letzten Ring gezeichnet
    push() // hier beginnt die Zeichnung der Baumrinde
    randomSeed(random(37, 99)); // hier wird die Bewegung gestoppt
    strokeWeight(5);
    blendMode(MULTIPLY);
    stroke(20, 100, 100, 0.7);

     for (let r = 545; r < radius; r += radius / numRings){
        beginShape();
      for (let a = 0; a < TAU; a += TAU/numPoints) {
        let x = cos(a) * r;
        let y = sin(a) * r;

        let n = map(noise(x * resolution, y * resolution), 0, 1, -scale, scale);

        curveVertex(x + n, y + n);

        if (random(0, 1.1) > 0.85 - 0.2 * sin(radius)) {
          endShape();
          beginShape();
        }
      }
      endShape();
    }
    pop();
  }

    // Hier beginnt der Text zu den Ringen
    push();
    if (index == age) {
      fill(100, 100, 100);
      stroke(hue, 100, 100);
      strokeWeight(15);
      strokeJoin(ROUND);
      textSize(20);
      textStyle(BOLD);
      text(`${temperature}°C`, radius * 0.71 - 40, -radius * 0.71 - 25);
      text(`${precipitation}mm`, radius * 0.71 - 40, -radius * 0.71 );
    }
    pop();
  });
  ringIndex = age;
}

// Info-Texte Updaten, wenn Slider betätigt wird
function updateSlider() {
  currentYear.innerText = cleanData[ageSlider.value()].year
  currentTemp.innerText = `${cleanData[ageSlider.value()].temperature}°C`
  currentHumd.innerText = `${cleanData[ageSlider.value()].precipitation}mm`
}