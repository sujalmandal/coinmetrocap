var test;
function main() {
	let url =
		"https://jsonp.afeld.me/?url=https%3A%2F%2Fexchange.coinmetro.com%2Fprices%2F";
	fetch(url)
		.then(res => res.json())
		.then(out => {
			calc(out);
		})
		.catch(err => {
			throw err;
		});
}

function calc(responce) {
	var listOfPairStrings = new Array();
	var listVolumes = new Array();
	var listOfPrices = new Array();
	var dictOfVolume = {};
	var dictOfPrice = {};
	var dictOfSpread = {};
	for (i = 0; i < responce.latestPrices.length; i++) {
		listOfPairStrings.push(responce.latestPrices[i].pair);
		listOfPrices.push(responce.latestPrices[i].price);
	}
	for (i = 0; i < responce["24hInfo"].length; i++) {
		listVolumes.push(responce["24hInfo"][i].v);
	}

	for (i = 0; i < responce["24hInfo"].length; i++) {
		pair = listOfPairStrings[i].substring(
			0,
			listOfPairStrings[i].length - 3
		);
		indexOfPrice = listOfPairStrings.indexOf(pair + "EUR");
		dictOfVolume[listOfPairStrings[i]] =
			listVolumes[i] * listOfPrices[indexOfPrice];
		dictOfPrice[listOfPairStrings[i]] =
			listOfPrices[i] * listOfPrices[indexOfPrice];
		if (responce.latestPrices[i].ask === undefined) {
			dictOfSpread[listOfPairStrings[i]] = 0;
		} else {
			if (
				listOfPairStrings[i].substring(
					listOfPairStrings[i].length - 3,
					listOfPairStrings[i].length
				) != "EUR"
			) {
				indexOfBase = listOfPairStrings.indexOf(
					listOfPairStrings[i].substring(
						listOfPairStrings[i].length - 3,
						listOfPairStrings[i].length
					) + "EUR"
				);
				dictOfSpread[listOfPairStrings[i]] =
					responce.latestPrices[i].ask * listOfPrices[indexOfBase] -
					responce.latestPrices[i].bid * listOfPrices[indexOfBase];
			} else {
				dictOfSpread[listOfPairStrings[i]] =
					responce.latestPrices[i].ask - responce.latestPrices[i].bid;
			}
		}
	}

	var tempVolString = [];
	var tempVolNum = [];
	for (var k in dictOfVolume) {
		if (dictOfVolume.hasOwnProperty(k)) {
			tempVolString.push(k);
			tempVolNum.push(dictOfVolume[k]);
		}
	}
	var data = [
		{
			values: tempVolNum,
			labels: tempVolString,
			type: "pie"
		}
	];
	var layout = {
		paper_bgcolor: "rgba(0,0,0,0)",
		plot_bgcolor: "rgba(0,0,0,0)"
	};
	volString = tempVolNum
		.reduce((a, b) => a + b, 0)
		.toFixed(2)
		.replace(/\d(?=(\d{3})+\.)/g, "$&,");
	Plotly.plot("pieVol", data, {
		autosize: true,
		title: "24hr Volume of CoinMetro Pairs (EUR)<br>Total volume is €".concat(
			volString
		),
		paper_bgcolor: "rgba(0,0,0,0)",
		plot_bgcolor: "rgba(0,0,0,0)",
		font: {
			family: "Inconsolata, monospace",
			size: 18,
			color: "#7f7f7f"
		}
	});
	var tempSpreadString = [];
	var tempSpreadNum = [];
	for (var k in dictOfSpread) {
		if (dictOfSpread.hasOwnProperty(k)) {
			tempSpreadString.push(k);
			tempSpreadNum.push(dictOfSpread[k]);
		}
	}
	var data = [
		{
			x: tempSpreadString,
			y: tempSpreadNum,
			type: "bar"
		}
	];
	var layout = {
		title: "24hr Spread of CoinMetro Pairs (EUR)",
		paper_bgcolor: "rgba(0,0,0,0)",
		plot_bgcolor: "rgba(0,0,0,0)",
		font: {
			family: "Inconsolata, monospace",
			size: 18,
			color: "#7f7f7f"
		}
	};
}
