import _ from "lodash";
import sha1 from "js-sha1";
import html2canvas from "html2canvas";
import { fromHex, rgbToHex } from "./lib/transforms";

const usernameInput = document.querySelector("#username");
const identiconGrid = document.querySelector("#identicon-grid");

// STATE

const state = {
  color: null,
  identicon: new Array(25).fill(0),
};

// LOGIC

function resetState() {
  state.color = null;
  state.identicon = new Array(25).fill(0);
}

function generate_identicon(username) {
  // Hash username with the SHA1 hasing algorithm.
  const hash = sha1(username.trim());

  // Tranform hash string into a typed-array and get RGB color.
  const binary = fromHex(hash);
  const [r, g, b] = binary;

  const identicon = _.reduce(
    _.chunk(_.take(binary, 15), 3),
    (result, row) => _.concat(result, row, _.reverse(_.dropRight(row))),
    []
  );

  state.color = rgbToHex(r, g, b);
  state.identicon = identicon;
}

usernameInput.addEventListener("input", (e) => {
  // Check if the input is the empty string.
  if (e.target.value === "") {
    resetState();
    render(state);
    return;
  }
  generate_identicon(e.target.value);
  render(state);
});

function take_snapshot() {
  // Enable snapshots when identicon is not blank.
  if (state.color) {
    html2canvas(identiconGrid).then((canvas) => {
      const a = document.createElement("a");
      a.download = "identicon.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    });
  }
}

function isOdd(num) {
  return num % 2 !== 0;
}

// RENDER

function clean(elem) {
  elem.innerHTML = "";
}

function render(state) {
  // Clear elements from the previous render.
  clean(identiconGrid);

  identiconGrid.className = `grid grid-cols-5 border-8 border-white ${
    state.color ? "hover:cursor-pointer" : ""
  }`;

  // Render identicon.
  state.identicon.forEach((value) => {
    // Pick cell's color.
    const color = isOdd(value) ? "#ffffff" : state.color;

    // Create cell element.
    const cell = document.createElement("div");
    cell.className = "w-12 h-12";
    cell.style = `background-color: ${color}`;

    identiconGrid.appendChild(cell);
  });
}

// Enable identicon snapshots.
document.addEventListener("DOMContentLoaded", () => {
  identiconGrid.addEventListener("click", take_snapshot);
});

render(state);
