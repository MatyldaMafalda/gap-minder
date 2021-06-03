import * as data from './json/data.json';

import './styles/bubble.scss';
import './styles/chart.scss';
import './styles/range-slider.scss';

import ScatterPlot from './ScatterPlot';

let time = 0;
let interval;
let chosenContinent = 'all';

const getData = () => {
	let formattedData = data.map((year) => {
		return year['countries']
			.filter((country) => {
				const dataExists = country.income && country.life_exp;
				if (chosenContinent === 'all') return dataExists;
				else {
					return dataExists && country.continent === chosenContinent;
				}
			})
			.map((country) => {
				country.income = Number(country.income);
				country.life_exp = Number(country.life_exp);
				return country;
			});
	});
	return formattedData;
};

const GapMinder = new ScatterPlot('.chart-container', getData()[0], time);

const play = document.getElementById('play-btn');
const reset = document.getElementById('reset-btn');
const continentSelector = document.getElementById('continents');
const dateSlider = document.getElementById('date-slider');

play.addEventListener('click', function () {
	const button = this;
	if (button.innerText === 'play') {
		button.innerText = 'stop';
		interval = setInterval(step, 150);
	} else {
		button.innerText = 'play';
		clearInterval(interval);
	}
});

reset.addEventListener('click', function () {
	time = 0;
	GapMinder.update(getData()[0], time);
});

continentSelector.addEventListener('change', (event) => {
	chosenContinent = event.target.value;
	GapMinder.update(getData(chosenContinent)[time], time);
});

dateSlider.addEventListener('change', (event) => {
	time = event.target.value - 1800;
	GapMinder.update(getData()[time], time);
});

const step = () => {
	time = time < 214 ? time + 1 : 0;
	dateSlider.value = time + 1800;
	GapMinder.update(getData()[time], time);
};
