var _ = require('lodash')
var Promise = require('bluebird')

var lib = require('../lib')

// getFarmers takes no argument and returns Array< Promise<Farmer> >
//   Farmers are objects including the field `name` and the field `retired`
//   if the farmer is retired.
var getFarmers = lib.getFarmers

// Pass the farmer name.
// Returns Promise< Array< Promise<Crop> > >
//   Crop has the fields `type` and `units`
var getCropsProducedByFarmer = lib.getCropsProducedByFarmer

// Pass the type of fruit.
// Return Promise<Number>
//   The number is the cost of one unit of the fruit.
var getCostOfSingleFruit = lib.getCostOfSingleFruit

//////////////////////////////////////////////////////////////////////////////////////////
// Implement the functions below this point
//////////////////////////////////////////////////////////////////////////////////////////

// Calculate the number of units of fruits owned by all farmers (whether
// retired or not) using getFarmers and getCropsProducedByFarmer.
exports.countNumberOfFruits = function() {
  return Promise.all(getFarmers()).then(function(farmers) {
	 //create a map of crops
	 var promises = _.map(farmers, function(farmer) {
		 return getCropsProducedByFarmer(farmer.name);
	 });
	 
	 return Promise.all(promises);
  }).then(function(crops) {
	  return Promise.resolve(
		_.chain(crops)
		 .flatten()
		 .sumBy('units')
		 .value()
	  );
  });
}

// Calculate the cost of all non-retired farmers' fruits using the functions
// getFarmers, getCropsProducedByFarmer and getCostOfSingleFruit.
// The cost of a Farmer's fruits can be calculated by summing the cost of each
// of their fruits, which is the cost of a single fruit times the number of units
// they have produced.
exports.calculateTotalFarmerFruitCost = function() {
  return Promise.all(getFarmers()).then(function(farmers) {
		//filter out retired farmers
		var unretiredFarmers = _.filter(farmers, function(farmer) {
			return !farmer.retired;
		});

		//create a map of crops without retired farmers
		var promises = _.map(unretiredFarmers, function(farmer) {
			return getCropsProducedByFarmer(farmer.name);
		});

		return Promise.all(promises);
  }).then(function(unretiredFarmersCrops) {
	  var crops = _.reduce(_.flatten(unretiredFarmersCrops), function(result, crop) {
		  result[crop.type] || (result[crop.type] = 0); //check if undefined or 0 value
		  result[crop.type] += crop.units; //get total units per type
		  return result;
	  }, {});

	  var promises = _.map(crops, function(units, type) {
		  return getCostOfSingleFruit(type).then(function(unitCost) {
			  return Promise.resolve(unitCost * units);
		  });
	  });
	  
	  return Promise.all(promises);
  }).then(function(costs) {
	  return Promise.resolve(
		_.sum(costs)
	  );
  });
}