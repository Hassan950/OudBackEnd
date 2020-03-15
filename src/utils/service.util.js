module.exports.getLimits = function getLimits(limits){
  (!limits.offset) ? 0 : limits.offset;
	(!limits.limit) ? 20 : limits.limit ;
	(limits.limit < 1) ? 1 : limits.limit ;
	(limits.limit > 50) ? 50 : limits.limit ;

	const start = parseInt(limits.offset);
	limits.limit = parseInt(limits.limit);

  const end = limits.limit + limits.offset;
  return {start , end} ;
}