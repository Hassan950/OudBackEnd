module.exports.getLimits = function getLimits(limits){
  (!limits.offset ) ? limits.offset = 0 : limits.offset;
	(!limits.limit) ? limits.limit = 20 : limits.limit ;
	(limits.limit < 1) ? limits.limit = 1 : limits.limit ;
	(limits.limit > 50) ? limits.limit = 50 : limits.limit ;

	const offset = parseInt(limits.offset);
	const limit = parseInt(limits.limit);
	
  return {offset , limit} ;
}