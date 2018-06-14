var dataController = (function () {
    var countriesList = [
        {name: 'Nashville', abbr: 'TN', latitude: 36.17, longitude: -86.78},
        {name: 'New York', abbr: 'NY', latitude: 40.71, longitude: -74.00},
        {name: 'Atlanta', abbr: 'GA', latitude: 33.75, longitude: -84.39},
        {name: 'Denver', abbr: 'CO', latitude: 39.74, longitude: -104.98},
        {name: 'Seattle', abbr: 'WA', latitude: 47.61, longitude: -122.33},
        {name: 'Los Angeles', abbr: 'CA', latitude: 34.05, longitude: -118.24},
        {name: 'Memphis', abbr: 'TN', latitude: 35.15, longitude: -90.05}
    ];

    var useCases = ['north', 'south', 'west', 'east'];


    function Map(countries) {

        this.countries = countries;

        this.getAllCountriesByAbbr = function () {
            var result = this.countries.map(function (country) {
                return country.abbr;
            });

            result = removeDuplicates(result);

            return result.join(" ").trim();
        };

        this.getMostRelatedByLatLng = function (val) {

            var lat = Math.abs(parseFloat(val[0]));
            var lng = Math.abs(parseFloat(val[1]));
            var min = Number.MAX_SAFE_INTEGER;

            var mostRelatedCountry = null;
            this.countries.forEach(function (country) {
                var countryLat = Math.abs(country.latitude);
                var countryLng = Math.abs(country.longitude);

                var difLat = Math.abs(lat - countryLat);
                var difLng = Math.abs(lng - countryLng);

                var difference = (difLat + difLng);
                if (difference < min) {
                    min = difference;
                    mostRelatedCountry = country;
                }
            });
            return mostRelatedCountry ? mostRelatedCountry.name : "";
        };

        this.getMostRelatedBySide = function (side) {
            var maxSide = Number.MIN_SAFE_INTEGER;
            var minSide = Number.MAX_SAFE_INTEGER;

            var mostRelatedCountry = null;
            this.countries.forEach(function (country) {
                var countryLat = country.latitude;
                var countryLng = country.longitude;
                switch (side) {
                    case useCases[0]:
                        if (countryLat > maxSide) {
                            maxSide = countryLat;
                            mostRelatedCountry = country;
                        }
                        break;
                    case useCases[1]:
                        if (countryLat < minSide) {
                            minSide = countryLat;
                            mostRelatedCountry = country;
                        }
                        break;
                    case useCases[2]:
                        if (countryLng < minSide) {
                            minSide = countryLng;
                            mostRelatedCountry = country;
                        }
                        break;
                    case useCases[3]:
                        if (countryLng > maxSide) {
                            maxSide = countryLng;
                            mostRelatedCountry = country;
                        }
                        break;
                }
            });

            return mostRelatedCountry ? mostRelatedCountry.name : "";
        };
    }

    function removeDuplicates(arr) {
        let unique_array = [];
        for (let i = 0; i < arr.length; i++) {
            if (unique_array.indexOf(arr[i]) === -1) {
                unique_array.push(arr[i])
            }
        }
        return unique_array
    }

    return {
        Map: Map,
        countries: countriesList,
        useCases: useCases
    }

})();

var viewContoller = (function (win, doc, dataControl) {

    var map = null;
    win.onload = function () {
        initEvents();
        var casesEl = doc.getElementById('cases');
        var listCountriesEl = doc.getElementById('list-countries');
        var listCountryNames = dataControl.countries.map(function (country) {
            return country.name;
        });
        casesEl.innerHTML = dataControl.useCases.join(", ");
        listCountriesEl.innerHTML = listCountryNames.join(", ");
        map = new dataControl.Map(dataControl.countries);
    };

    function onSubmit(event) {
        event.preventDefault();

        var input = doc.getElementById('user-input-data');
        var value = input.value.toLowerCase().trim();

        var resultEl = doc.getElementById('result');
        var mostRelCountry = null;

        var info = "Please insert correct data";
        var splitStr = value.trim().replace(/ /g, '').split(",");

        var isNumRes = [];
        splitStr.forEach(function (str) {
            isNumRes.push(isNumeric(str));
        });

        var isNum = isNumRes.indexOf(false) === -1;

        var result = null;
        var countriesAbbrStr = map.getAllCountriesByAbbr();
        if (isNum) {
            result = map.getMostRelatedByLatLng(splitStr);
            if (result) {
                mostRelCountry = result;
                info = "From <span class='bold'>" + countriesAbbrStr + "</span> the closest to your data is <span class='bold'>" + mostRelCountry + "</span>";
            }
        } else {
            result = map.getMostRelatedBySide(value);
            if (result) {
                mostRelCountry = result;
                info = "From <span class='bold'>" + countriesAbbrStr + "</span> the closest to your data is <span class='bold'>" + mostRelCountry + "</span>";
            }
        }

        renderResult(info, resultEl);
    }

    function isNumeric(num) {
        return !isNaN(num)
    }

    function renderResult(result, resultEl) {
        resultEl.innerHTML = result;
    }

    function initEvents() {
        var form = doc.getElementById("input-form");
        form.addEventListener('submit', onSubmit);
    }

})(window, document, dataController);