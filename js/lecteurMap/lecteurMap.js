function Map(params){
	
	//Ici requete pour avoir le JSON du serveur.
	
	this.JSON =  {
		"id_map": 1,
		"id_player" : 0,
		"map": [
			{
				"x": 300,
				"y": 570,
				idObj: 0,
				components: [],
				flags: 0,
				options: {
					x:60,
					y:0
				},
			},
			{
				"x": 660,
				"y": 570,
				idObj: 0,
				components: [],
				flags: 0,
				options: {
					x:120,
					y:0
				},
			},
			{
				"x": 930,
				"y": 540,
				idObj: 1,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 1020,
				"y": 510,
				idObj: 3,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 1140,
				"y": 570,
				idObj: 0,
				components: [],
				flags: 0,
				options: {
					x:420,
					y:0
				},
			},
			{
				"x": 1170,
				"y": 510,
				idObj: 2,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 1260,
				"y": 480,
				idObj: 2,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 1380,
				"y": 510,
				idObj: 2,
				components: [1],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 1860,
				"y": 515,
				idObj: 5,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 2160,
				"y": 570,
				idObj: 0,
				components: [],
				flags: 0,
				options: {
					x:120,
					y:0
				},
			},
			{
				"x": 2310,
				"y": 540,
				idObj: 1,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 2370,
				"y": 495,
				idObj: 3,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 2370,
				"y": 495,
				idObj: 6,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 2520,
				"y": 510,
				idObj: 4,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 2550,
				"y": 510,
				idObj: 6,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 2880,
				"y": 540,
				idObj: 1,
				components: [],
				flags: 1,
				options: {
					x:0,
					y:0
				},
			},
			{
				"x": 2880,
				"y": 525,
				idObj: 5,
				components: [],
				flags: 0,
				options: {
					x:0,
					y:0
				},
			},
		],
		//De même pour le ghost qui a besoin d'être récupéré du serveur.
		//Lecteur Indépendant.
		"Ghost" : []
	}
	
	this.map = this.JSON.map;
	/*
		Fonction de tecture du JSON et d'affichage des objets.
		Elle prend en parametre une position en x (surement en y aussi plus tard)
		x est la position en x du bord gauche du canvas sur la carte entière.
	*/
	this.run = function(x){
		var toPrint = [];
		for(i = 0; i < this.map.length; i++){
			if(this.map[i].x < x+800 && this.map[i].x > x){
				toPrint.push(this.map[i]);
			}
		}
		for(i = 0; i < toPrint.length; i++){
			if(toPrint[i].idObj > 0){
				ctx.fillStyle = '#fff';
				ctx.fillRect(toPrint[i].x - x, toPrint[i].y, 30, 30);
			}
			else{
				ctx.fillStyle = '#000';
				ctx.fillRect(toPrint[i].x - x, toPrint[i].y, toPrint[i].options.x, 30);
			}
		}
	}
}