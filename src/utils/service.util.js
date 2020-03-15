module.exports.getLimits = function getLimits(limits){
  (!limits.offset ) ? limits.offset = 0 : limits.offset;
	(!limits.limit) ? limits.limit = 20 : limits.limit ;
	(limits.limit < 1) ? limits.limit = 1 : limits.limit ;
	(limits.limit > 50) ? limits.limit = 50 : limits.limit ;

	const start = parseInt(limits.offset);
	const end = parseInt(limits.limit);
	
  return {start , end} ;
}