
(function() {

	var namegen = {};

	/* Words by category. Words may appear in multiple categories */
	module.exports = namegen;

	var wordbits = [
		"ab","ac","ad","ag","ah","al","am","an","ap","ar","as","at","aw","ax","az",
		"ba","be","bi","bo","bu","by",
		"ca","ce","ci","co",
		"da","de","di","do","du","dy",
		"eb","ec","ed","ef","eg","el","em","en","ep","er","es","et","ev","ex","ez",
		"fa","fe","fi","fo",
		"ga","ge","gi","go","gu","gy",
		"ha","he","hi","ho","hu",
		"ib","ic","id","if","ig","il","im","in","ip","ir","is","it","iv","ix","iz",
		"ja","je","jo","ju",
		"ka","ke","ko","ku",
		"la","le","li","lo","lu","ly",
		"ma","me","mi","mo","mu","my",
		"na","ne","no",
		"od","of","og","oh","ol","om","on","op","or","os","ot","ow","ox","oy","oz",
		"pa","pi","po","pu",
		"qua","que","qui","quo",
		"ra","re","ri","ro","ru","ry",
		"sa","se","si","so","su",
		"ta","te","ti","to","tu",
		"ub","ud","ug","ul","um","un","up","us","ur","ut","ux",
		"ve","vi","vo",		"wa","we","wi","wo","wy",
		"xe","xy",
		"ya","ye","yo",
		"za","ze","zo","zy",
		"ath","eth","oth","uth",
		"ess","iss","oss","uss",
		"ach","ich","och",
		"tra","tre","tri","tro","tru","try",
		"sla","sle","sli","slo",
		"sha","she","sho","shu",
		"gra","gre","gri","gro","gry",
		"stra","stre","stri","stro","stru","stry",
		"pla","ple","pli","plo","plu",
		"mar","mer","mor",
		"bar","ber","bor","bur",
		"tar","ter","tor","tur",
		"lar","lir","lor","lur",
		"bat","bet","bit",
		"cat","cot","cut",
		"det","dot",
		"mat","met","mit",
		"arm","erm","orm","urm",
		"fat","fit",
		"gan","gin","gon","gun",
		"has","his","hos",
		"mas","mis","mus","mys",
		"rat","rot","rut",
		"ang","eng","ing","ong","ung",
		"egg","igg","ogg","ugg",
		"are","ari","aro","aru",
		"pre","pra","pri","pro","pru","pry",
		"sta","ste","sti","sto","stu","sty",
		"ach","ech","ich","och",
		"ack","eck","ick","ock",
		"pan","pen","pin","pon","pun",
		"can","cin","con",
		"tam","tem","tim","tom",
		"bar","ber","bir","bor","bur",
		"abb","ebb","ibb","obb","ubb",
		"all","ell","ill","oll","ull",
		"ast","est","ist","ost","ust",
		"aen","ain","aon","aun","ean","een","ein","eon","ian","ion","oen","oin","oon","oun","uan","uen","uin","uon",
		"and","end","ind","ond","und",
		"tha","the","thi","tho","thu",
		"ant","ent","int",
		"tao","teo","tio","too","two",
		"far","fer","fir","for","fur",
		"nda","nde","ndi","ndo","ndu",
		"nba","nbe","nbo","nbu",
		"nga","nge","ngo","ngu",
		"nza","nze","nzo","nzu",
		"tas","tis","tos","tus",
		"aft","eft","ift","oft","uft",
		"man","men","min","mon","mun",
		"mna","mno","mnu"
	];

	var wordmap = {
		"ii": "i",
		"aa": "a",
		"uu": "u",
		"''": "'",
		"qq": "q",
	};


	namegen.word = function(random, scale) {
		if (!scale) {
			scale = 3;
		}
		var wbl = wordbits.length;
		var word = "";
		var nl = random.rand(scale)+2;
		for (var j=0;j<nl;j++) {
			var part = wordbits[random.rand(wbl)];
			if (part.length > 2) {
				// bias towards smaller name fragments
				part = wordbits[random.rand(wbl)];
			}
			word += part;
		}
		for (j in wordmap) {
			word = word.replace(j,wordmap[j]);
		}
		word = word.replace(/^'/,"");
		word = word.replace(/'$/,"");
		word = word.replace(/([aeiou][aeiou])[aeiou]+/,"$1");
		return word.replace(/^./, function (str) { return str.toUpperCase(); });
	}

	module.exports = namegen;

}());