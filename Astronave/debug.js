// Libreria con varie funzioni di debug per Astronave.js

// Costanti per il debug
class Debug{
	assi;
		asseX;
		asseY;
	
	puntiNotevoliAstronave;
	puntiNotevoliAsteroidi;
		cerchioInterno;
		cerchioEsterno;
		rettangolo;
		diagonali;
		altezze;
	
	astronave;
	asteroidi;
	collisioni;
	
	constructor(){
		this.assi = false;
			this.asseX = true;
			this.asseY = true;
		
		this.puntiNotevoliAstronave = false;
		this.puntiNotevoliAsteroidi = false;
			this.cerchioInterno = true;
			this.cerchioEsterno = false;
			this.rettangolo = true;
			this.diagonali = false;
			this.altezze = false;
		
		this.astronave = true;
		this.asteroidi = true;
		this.collisioni = true;
	}
	
	MostraAssi(){
		// Mostra asse Y
		if(this.asseY){
			finestra.contesto.beginPath();
			finestra.contesto.moveTo(finestra.width/2, 0);
			finestra.contesto.lineTo(finestra.width/2, finestra.height);
			finestra.contesto.stroke();
		}
		
		// Mostra asse X
		if(this.asseX){
			finestra.contesto.beginPath();
			finestra.contesto.moveTo(0, finestra.height/2);
			finestra.contesto.lineTo(finestra.width, finestra.height/2);
			finestra.contesto.stroke();
		}
	}

	MostraPuntiNotevoli(ent){
		// Mostra circonferenza esterna
		if(this.cerchioEsterno){
			finestra.contesto.beginPath();
			finestra.contesto.arc(ent.x, ent.y, ent.diagonal/2, 0, 2 * Math.PI);
			finestra.contesto.stroke();
		}
		
		// Mostra circonferenza interna
		if(this.cerchioInterno){
			finestra.contesto.beginPath();
			finestra.contesto.arc(ent.x, ent.y, ent.width/2, 0, 2 * Math.PI);
			finestra.contesto.stroke();
		}
		
		// Mostra rettangolo
		if(this.rettangolo){
			finestra.contesto.beginPath();
			finestra.contesto.moveTo(ent.vertice[0]['X'], ent.vertice[0]['Y']);
			finestra.contesto.lineTo(ent.vertice[1]['X'], ent.vertice[1]['Y']);
			finestra.contesto.lineTo(ent.vertice[2]['X'], ent.vertice[2]['Y']);
			finestra.contesto.lineTo(ent.vertice[3]['X'], ent.vertice[3]['Y']);
			finestra.contesto.lineTo(ent.vertice[0]['X'], ent.vertice[0]['Y']);
			finestra.contesto.stroke();
		}
		
		// Mostra diagonali
		if(this.diagonali){
			finestra.contesto.beginPath();
			finestra.contesto.moveTo(ent.vertice[0]['X'], ent.vertice[0]['Y']);
			finestra.contesto.lineTo(ent.vertice[2]['X'], ent.vertice[2]['Y']);
			finestra.contesto.stroke();
			
			finestra.contesto.beginPath();
			finestra.contesto.moveTo(ent.vertice[1]['X'], ent.vertice[1]['Y']);
			finestra.contesto.lineTo(ent.vertice[3]['X'], ent.vertice[3]['Y']);
			finestra.contesto.stroke();
		}
		
		// Mostra i collegamenti tra medi
		if(this.altezze){
			finestra.contesto.beginPath();
			finestra.contesto.moveTo(ent.medio[0]['X'], ent.medio[0]['Y']);
			finestra.contesto.lineTo(ent.medio[2]['X'], ent.medio[2]['Y']);
			finestra.contesto.stroke();
			
			finestra.contesto.beginPath();
			finestra.contesto.moveTo(ent.medio[1]['X'], ent.medio[1]['Y']);
			finestra.contesto.lineTo(ent.medio[3]['X'], ent.medio[3]['Y']);
			finestra.contesto.stroke();
		}
	}
}

