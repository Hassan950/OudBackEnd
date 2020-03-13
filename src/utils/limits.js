module.exports.getLimits = function getLimits(limits){
  if (!limits.offset) limits.offset = 0;
	if (!limits.limit) limits.limit = 20;
	if (limits.limit < 1) limits.limit = 1;
	if (limits.limit > 50) limits.limit = 50;

	const start = parseInt(limits.offset);
	limits.limit = parseInt(limits.limit);

  const end = limits.limit + limits.offset;
  return {start , end} ;
}