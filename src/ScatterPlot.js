import * as d3 from 'd3';
import d3Tip from 'd3-tip';

export default class ScatterPlot {
	constructor(parentElement, data, time) {
		this._parentElement = parentElement;
		this._data = data;
		this._time = time;
		this.initViz();
	}

	initViz() {
		this.MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
		this.WIDTH = 1000 - this.MARGIN.LEFT - this.MARGIN.RIGHT;
		this.HEIGHT = 700 - this.MARGIN.TOP - this.MARGIN.BOTTOM;

		this.svg = d3
			.select(this._parentElement)
			.append('svg')
			.attr(
				'viewBox',
				`0 0 ${this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT} ${
					this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM
				}`
			)
			.attr('width', this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
			.attr('height', this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM)
			.attr('class', 'chart-svg');

		this.g = this.svg
			.append('g')
			.attr('transform', `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);

		this.createScales();
		this.createLabels();
		this.createAxis();
		this.createLegend();
		this.createTooltip();
		this.update(this._data, this._time);
	}

	createScales() {
		this.x = d3
			.scaleLog()
			.base(10)
			.range([0, this.WIDTH])
			.domain([142, 150000]);
		this.y = d3.scaleLinear().range([this.HEIGHT, 0]).domain([0, 90]);
		this.scaleCircle = d3
			.scaleLinear()
			.range([25 * Math.PI, 1500 * Math.PI])
			.domain([2000, 1400000000]);

		this.continentColor = d3.scaleOrdinal([
			'#59a882',
			'#7b47ff',
			'#2ba0ff',
			'#fcda4e',
			'#ffa126',
			'#1f2aff',
		]);
	}

	createLabels() {
		this.g
			.append('text')
			.attr('y', this.HEIGHT + 50)
			.attr('x', this.WIDTH / 2)
			.attr('class', 'chart-label')
			.text('GDP Per Capita ($)');

		this.g
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', -40)
			.attr('x', -170)
			.attr('class', 'chart-label')
			.attr('text-anchor', 'end')
			.text('Life Expectancy (Years)');

		this.timeLabel = this.g
			.append('text')
			.attr('y', 400)
			.attr('x', 600)
			.attr('class', 'year-label')
			.attr('text-anchor', 'middle')
			.text('1800');
	}

	createAxis() {
		this.xAxisCall = d3
			.axisBottom(this.x)
			.tickValues([400, 4000, 40000, 150000])
			.tickFormat(d3.format('$'));

		this.g
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0, ${this.HEIGHT})`)
			.call(this.xAxisCall);

		this.yAxisCall = d3.axisLeft(this.y);

		this.g.append('g').attr('class', 'y axis').call(this.yAxisCall);
	}

	createLegend() {
		this.continets = [
			'Africa',
			'South Americas',
			'Asia',
			'North America',
			'Europe',
			'Australia',
		];

		this.legend = this.g
			.append('g')
			.attr('transform', `translate(${this.WIDTH - 10}, ${this.HEIGHT - 125})`);

		this.continets.forEach((continent, i) => {
			const legendRow = this.legend
				.append('g')
				.attr('transform', `translate(0, ${i * 20})`);
			legendRow
				.append('rect')
				.attr('width', 10)
				.attr('height', 10)
				.attr('fill', this.continentColor(continent));
			legendRow
				.append('text')
				.attr('x', -10)
				.attr('y', 10)
				.attr('text-anchor', 'end')
				.attr('class', 'legend-text')
				.text(continent);
		});
	}

	createTooltip() {
		this.tip = d3Tip()
			.attr('class', 'tooltip')
			.html((d) => {
				let text = `<div>Country: ${d.country}</div>`;
				text += `<div>Continent: ${d.continent}</div>`;
				text += `<div>Life expectancy: ${d3.format('.2f')(d.life_exp)}</div>`;
				text += `<div>Income: ${d3.format('$,.0f')(d.income)}</div>`;
				text += `<div>Population: ${d.population}</div>`;
				return text;
			});
		this.g.call(this.tip);
	}

	update(data, time) {
		const viz = this;

		this.t = d3.transition().duration(100);
		this.gcircles = this.g.selectAll('.bubble').data(data, (d) => d.country);
		this.gcircles.exit().remove();

		this.gEnter = this.gcircles
			.enter()
			.append('g')
			.attr('class', 'bubble')
			.on('mouseover', function (d, i) {
				viz.tip.show(i, this);
			})
			.on('mouseout', this.tip.hide);

		this.gEnter
			.append('circle')
			.attr('fill', (d) => this.continentColor(d.continent))
			.attr('class', 'bubble-circle');

		this.gEnter.append('text');

		this.gcircles = this.gEnter.merge(this.gcircles);

		this.gcircles
			.select('circle')
			.transition(this.t)
			.attr('cy', (d) => this.y(d.life_exp))
			.attr('cx', (d) => this.x(d.income))
			.attr('r', (d) => {
				return Math.sqrt(this.scaleCircle(d.population) / Math.PI);
			});

		this.gcircles
			.select('text')
			.text((d) => d.country)
			.attr('dy', (d) => this.y(d.life_exp))
			.attr('dx', (d) => this.x(d.income));

		this.timeLabel.text(String(time + 1800));
	}
}
