// File JavaScript del file Astronave.html
const deBug = new Debug();
/*	FILE UTILIZZATI	
*	
*	funzioni.js
*	debug.js
*
*/

/*	MODIFICHE
*	collisioni - da fare
*/


// Link delle immagini
const LINKASTRONAVE = "astronave.png";
const LINKASTEROIDE = "asteroide.png";

// Costanti utili
const CLOCK = 5;
const VELOCITAGIRO = 1.4; // Velocità rotazione astronave
const VELOCITAVOLO = 3; // Velocità astronave 
const VELOCITAASTEROIDE = 1; // Velocità asteroide
const NUMEROASTEROIDI = 5; // Numero massimo degli asteroidi in mappa

// Variabili di gioco
var statoPartita = "DI"; // DI = da iniziare, IC = in corso, PF = finita, PP = pausa

// Oggetti di gioco
var finestra = {};
var astronave = {};
var missile = [];
var asteroide = [];
var astronaveNemica = [];

class Finestra{
	canvas;
	contesto;
	
	height;
	width;
	
	constructor(elemento){
		this.canvas = elemento;
		this.contesto = elemento.getContext('2d');
		
		this.height = elemento.height;
		this.width = elemento.width;
	}
}

class Entita{
	elemento; // Elemento rappresentante un'immagine png
	
	elementoCaricato; // Variabile booleana che indica lo stato di caricamento dell'elemento
	elementoPosizionato; // Variabile booleana che indica se un elemeno è già stato posizionato o no
	
	height; // Altezza
	width; // Larghezza
	diagonal; // Diagonale
	angoloInterno; // Angolo tra la diagonale e l'asse delle Y
	
	x; // Posizione orizontale dal centro dell'entità
	y; // Posizione verticale dal centro dell'entità
	
	// Posizione dei vertici rispetto centro
	vertice = [{},{},{},{}];
	// Posizione dei punti medi di ogni lato rispetto centro
	medio = [{},{},{},{}];
	
	inMappa; // true = entità interna alla mappa, false = entità esterna alla mappa
	
	angolazione; // Angolazione dell'entità
	velocitaRotazione; // Velocita di rotazione
	
	velocita; // Velocità di default
	velocitaX; // Velocità sull'asse delle X
	velocitaY; // Velocità sull'asse delle Y
	
	constructor(linkElemento){
		// Inizializzazione attributi
		let elemento = document.createElement("img");
		elemento.src = linkElemento;
		
		this.elemento = elemento;
		this.elementoCaricato = false;
		this.elementoPosizionato = false;
		this.velocitaRotazione = 0;
		this.angolazione = 0;
		this.velocita = 0;
		
		// Inizializzazione attributi una volta caricato in memoria l'elemento html dell'entità
		this.elemento.onload = () => {
			// Imposto che l'elemento è caricato
			this.elementoCaricato = true;			
			// Prendo le dimensioni dell'elemento png
			this.dimensiona(this.elemento.width, this.elemento.height);
		};
	}
	
	// Assegna una dimensione all'entità
	dimensiona(w, h){
		this.width = w;
		this.height = h;
		this.diagonal = Math.sqrt(w*w+h*h);
		this.angoloInterno = Math.atan(w/h)*180/Math.PI;
	}
	
	// Assegna una posizione all'entità
	posiziona(x, y){
		this.x = x;
		this.y = y;
		this.elementoPosizionato = true;
		this.aggiornaVertici();
		this.aggiornaMedi();
	}
	
	// Aggiorna i valori dei 4 vertici dell'entità rispetto al centro
	aggiornaVertici(){
		/* Con angolazione 0
		*	vertice 0 = in alto a sinistra
		*	vertice 1 = in alto a destra
		*	vertice 2 = in basso a destra
		*	vertice 3 = in basso a sinistra
		*/
		/* RAGIONAMENTO
		*
		*	Devo tenere in conto l'angolo dell'intera entità con l'asse delle Y e
		*	l'angolo preesistente tra la diagonale dell'entità(che si collega quindi ai vertici)
		*	e l'asse delle Y.
		*	I due angoli si sommano o si sottraggono a seconda del vertice che tengo in considerazione
		*/
		/* APPLICAZIONE
		*
		*	Sia A l'angolo dell'intera entità,
		*	sia B l'angolo della diagonale,
		*	sia C(Xc, Yc) il punto centrale dell'entità,
		*	sia D la semilunghezza della diagonale,
		*	siano i punti V0(X0, Y0), V1(X1, Y1), V2(X2, Y2) e V3(X3, Y3) i vertici dell'entità,
		*	si ha allora:
		*	
		*	X0 = Xc+sin(A-B)*D;
		*	Y0 = Yc-cos(A-B)*D;
		*	
		*	X1 = Xc+sin(A+B)*D;
		*	Y1 = Yc-cos(A+B)*D;
		*
		*	X2 = Xc-sin(A-B)*D;
		*	Y2 = Yc+cos(A-B)*D;
		*
		*	X3 = Xc-sin(A+B)*D;
		*	Y3 = Yc+cos(A+B)*D;
		*/
		
		// Variabili di lavoro
		let differenza = (this.angolazione - this.angoloInterno)*Math.PI/180; // Differenza dell'angolo interno ed esterno
		let somma = (this.angolazione + this.angoloInterno)*Math.PI/180; // Somma dell'angolo interno ed esterno
		let d = this.diagonal/2; // Semilunghezza della diagonale
		
		let sd = Math.sin(differenza)*d;
		let cd = Math.cos(differenza)*d;
		let ss = Math.sin(somma)*d;
		let cs = Math.cos(somma)*d;
		
		this.vertice[0]['X'] = this.x+sd;
		this.vertice[0]['Y'] = this.y-cd;
		
		this.vertice[1]['X'] = this.x+ss;
		this.vertice[1]['Y'] = this.y-cs;
		
		this.vertice[2]['X'] = this.x-sd;
		this.vertice[2]['Y'] = this.y+cd;
		
		this.vertice[3]['X'] = this.x-ss;
		this.vertice[3]['Y'] = this.y+cs;
	}
	
	// Aggiorna i valori dei punti medi di ogni lato dell'entità
	aggiornaMedi(){
		/* Con angolazione 0
			medio 0 = medio lato superiore 
			medio 1 = medio lato destro
			medio 2 = medio lato inferiore
			medio 3 = medio lato sinistro
		*/
		
		// Il medio di un lato si trova esattamente al centro dei vertici di quel lato
		this.medio[0]['X'] = (this.vertice[0]['X']+this.vertice[1]['X'])/2;
		this.medio[0]['Y'] = (this.vertice[0]['Y']+this.vertice[1]['Y'])/2;
		
		this.medio[1]['X'] = (this.vertice[1]['X']+this.vertice[2]['X'])/2;
		this.medio[1]['Y'] = (this.vertice[1]['Y']+this.vertice[2]['Y'])/2;
		
		this.medio[2]['X'] = (this.vertice[2]['X']+this.vertice[3]['X'])/2;
		this.medio[2]['Y'] = (this.vertice[2]['Y']+this.vertice[3]['Y'])/2;
		
		this.medio[3]['X'] = (this.vertice[3]['X']+this.vertice[0]['X'])/2;
		this.medio[3]['Y'] = (this.vertice[3]['Y']+this.vertice[0]['Y'])/2;
		
	}

	// Modifica la posizione dell'entità nel tempo
	muovi(){
		// Verifico se la velocità è 0 o no
		// Nel caso in cui non sia in movimento (velocità = 0) salto gli altri passaggi
		if(this.velocita != 0){			
			// Calcolo delle velocità orizzontali e verticali
			// L'angolazione è calcolata rispetto all'asse delle Y e aumenta in senso orario
			this.velocitaX = -this.velocita*Math.sin(this.angolazione*Math.PI/180);
			this.velocitaY = this.velocita*Math.cos(this.angolazione*Math.PI/180);
			// Modifica della posizione dei punti notevoli in base alla velocità
			this.x += this.velocitaX;
			this.y += this.velocitaY;
			for(let i = 0; i<4; i++){
				this.vertice[i]['X'] += this.velocitaX;
				this.vertice[i]['Y'] += this.velocitaY;
				
				this.medio[i]['X'] += this.velocitaX;
				this.medio[i]['Y'] += this.velocitaY;
			}
		}
	}
	
	// Modifica l'angolazione rispetto all'asse delle Y
	gira(){
		// Verifico se la velocità di rotazione è 0 o no
		// Nel caso in cui non stia girando (velocità = 0) salto gli altri passaggi
		if(this.velocitaRotazione != 0){
			this.angolazione += this.velocitaRotazione;
			if(this.angolazione < 0) this.angolazione += 360; 
			if(this.angolazione > 360) this.angolazione -= 360;
			this.aggiornaVertici();
			this.aggiornaMedi();
		}
	}
	
	// Consente di modificare inMappa a seconda della posizione
	// x1 = X di inizio mappa, x2 = X di fine mappa, y1 = Y di inizio mappa, y2 = Y di fine mappa 
	verificaStatoInMappa(x1, x2, y1, y2){
		// Se è all'interno dei confini della mappa, è debtro la mappa
		// Altrimenti è fuori dalla mappa (inMappa = false)
		if(this.x >= x1 && this.x <= x2 && this.y >= y1 && this.y <= y2)
			this.inMappa = true;
		else
			this.inMappa = false;
	}
	
	// Se necessario, mantiene l'entità sul bordo della mappa
	// x1 = X di inizio mappa, x2 = X di fine mappa, y1 = Y di inizio mappa, y2 = Y di fine mappa 
	mantieniSulBordo (x1, x2, y1, y2){
		if(this.x < x1) this.x = x1;
		if(this.x > x2) this.x = x2;
		if(this.y < y1) this.y = y1;
		if(this.y > y2) this.y = y2;
		this.aggiornaVertici();
		this.aggiornaMedi();
	}
}

// Classe del giocatore/astronave
class Astronave extends Entita{
	constructor(linkAstronave){
		super(linkAstronave);
	}
}

// Classe degli asteroidi
class Asteroide extends Entita{
	constructor(linkAsteroide){
		super(linkAsteroide);
	}
}

// Funzione che ridisegna il campo ad ogni aggiornamento
function disegna(){
	// Disegno dell'astronave
	if(astronave.elementoCaricato)
		drawRotateImage(finestra.contesto, astronave.elemento, astronave.x, astronave.y, astronave.angolazione);
	
	// Disegna ogni asteroide
	asteroide.forEach(function(sasso){
		if(sasso.elementoCaricato)
			drawRotateImage(finestra.contesto, sasso.elemento, sasso.x, sasso.y, sasso.angolazione);
	});
	
}

function gestisciAstronave(){
	// Controllo se questa è stata caricata in memoria
	if(astronave.elementoCaricato){
		// Se l'atronave ancora non è stata posizionata, la posiziono
		if(!astronave.elementoPosizionato)
			astronave.posiziona(finestra.width/2, finestra.height/2);
		
		// Gestisco i movimenti dell'astonave
		astronave.gira();
		astronave.muovi();
		
		// Faccio in modo che l'astronave non superi il bordo
		astronave.verificaStatoInMappa(0, finestra.width, 0, finestra.height);
		if(!astronave.inMappa)
			astronave.mantieniSulBordo(0, finestra.width, 0, finestra.height);
	}
}

function posizionaAsteroide(ast){
	// Imposto la velocità dell'astronave
	ast.velocita = VELOCITAASTEROIDE;
	
	// Imposto un'angolazione casuale da 40 a 140 gradi
	ast.angolazione = Math.random()*100+40;
	
	/*
	*	L'asteroide punta inizilmente da est ad ovest
	*
	*	Se si trova a sud, giro di 90° verso nord
	*	Se si trova a nord, giro di 90° verso sud
	*	Se si trova ad ovest, giro di 180° gradi
	*	Se si trova ad est, lo lascio così com'è
	*/
	
	// Prendo un punto a caso sul bordo su cui posizionare l'asteroide	
	let x, y; // X casuale, Y casuale
	let z = Math.random(); // Casuale. Indica il lato della finestra sul quale posizionare l'asteroide (N, S, O, E)
	if(z < 0.5){
		// Bordo sinistro <0.25 (Ovest)
		// Bordo destro >0.25 (Est)
		if (z < 0.25){
			x = 0;
			ast.angolazione += 180;
		}else{
			x = finestra.width;
			// ast.angolazione += 0;
		}
		y = Math.random()*finestra.height;
	}else{					
		// Bordo superiore <0.75 (Nord)
		// Bordo inferiore >0.75 (Sud)
		if (z < 0.75){
			y = 0;
			ast.angolazione -= 90;
		}else{
			y = finestra.height;
			ast.angolazione += 90;
		}
		x = Math.random()*finestra.width;
	}
	ast.posiziona(x, y);			
}

function gestisciAsteroide(){
	if(asteroide.length < NUMEROASTEROIDI){
		asteroide.push(new Asteroide(LINKASTEROIDE));
	}
	
	asteroide.forEach(function(sasso, numero){
		if(sasso.elementoCaricato){
			// Se non è posizionato in mappa, lo posiziono e lo faccio partire
			if(!sasso.elementoPosizionato){
				posizionaAsteroide(sasso);
			}
			
			// Muovo gli asteroidi che ci sono
			sasso.muovi();
			
			// Elimino gli asteroidi quando escono dalla mappa
			sasso.verificaStatoInMappa(0, finestra.width, 0, finestra.height);
			if(!sasso.inMappa)
				asteroide.splice(numero, 1);
		}
	});
}

// Funzione che date due entità assume vero se vi esistono dei punti di intersezione tra i cerchi interni
// Cerchio interno = cerchio con centro l'intersezione delle diagonali e con raggio metà della lunghezza
function verificaCollisioni(e1, e2){	
	// Distanza dei centri delle due entità
	var dist = Math.sqrt((e1.x-e2.x)**2+(e1.y-e2.y)**2);
	
	// Somma dei raggi dei cerchi interni delle entità
	var sommaR = (e1.width+e2.width)/2;	
	
	// Se la distanza dei centri è minore della somma dei raggi le due entità sono in collisione
	if(dist < sommaR) return true;
	else return false;
}

function gestisciCollissioni(){
	// Verifica collisione tra astronave e gli asteroidi
	asteroide.forEach(function(sasso){
		if(sasso.elementoPosizionato){
			if(verificaCollisioni(sasso, astronave)) statoPartita = "PF";
			console.log(statoPartita);
		}
	});
}

// Clock di gioco
var myClock;

// Motore di gioco richiamato dal clock
var gameEngine = ()=> {
	// Ripilisco la finestra di gioco
	finestra.contesto.clearRect(0, 0, finestra.width, finestra.height);
	if (deBug.assi) deBug.MostraAssi();
	
	// Gestisco i movimenti dell'astronave
	if (deBug.astronave) gestisciAstronave();
	if (deBug.puntiNotevoliAstronave) deBug.MostraPuntiNotevoli(astronave);
	
	// Gestisco gli asteroidi
	if (deBug.asteroidi) gestisciAsteroide();
	if (deBug.puntiNotevoliAsteroidi) asteroide.forEach(sasso => deBug.MostraPuntiNotevoli(sasso));
	
	// Verifico e gestisco le collisioni tra entità
	if (deBug.collisioni) gestisciCollissioni();
	
	// Ridisegno la finestra di gioco aggiornata
	disegna();
}

// Funzione che mette in pausa la partita
function stop(){
	clearInterval(myClock);	
	statoPartita = "PP";
}

// Funzione che fa partire la partita
function play(){
	myClock = setInterval(gameEngine, CLOCK);
	statoPartita = "IC";
}

window.addEventListener('load', () => {
	// Assegno una finestra di gioco
	finestra = new Finestra(document.getElementById("finestra"));
	
	// Dichiaro l'oggetto astronave/giocatore
	astronave = new Astronave(LINKASTRONAVE);
	
	// Faccio partire la partita e imposto il clock di gioco
	play();
});

// -GESTIONE COMANDI-
window.addEventListener('keydown', () => {
	// w = 87, s = 83, a = 65, d = 68
	// p = 80
	// up = 38, down = 40, right = 39, left = 37 
	// space = 32, send = 13
	
	// Mette in pausa o fa ripartire la partita
	if(event.keyCode == 80)
		if(statoPartita == "IC" || statoPartita == "PF") stop();
		else if(statoPartita == "PP") play();
	
	// Va avanti
	if(event.keyCode == 87 || event.keyCode == 38)
		astronave.velocita = -VELOCITAVOLO;
	
	// Gira
	if(event.keyCode == 65 || event.keyCode == 37)
		astronave.velocitaRotazione = -VELOCITAGIRO;
	if(event.keyCode == 68 || event.keyCode == 39)
		astronave.velocitaRotazione = VELOCITAGIRO;
});
window.addEventListener('keyup', () => {
	// w=87 s=83 a=65 d=68
	// up=38 down=40 right=39 left=37 
	// 32=space 13=invio
	
	// Smette di andare avanti
	if(event.keyCode == 87 || event.keyCode == 38 || event.keyCode == 83 || event.keyCode == 40)
		astronave.velocita = 0;
	
	// Smette di girare
	if(event.keyCode == 65 || event.keyCode == 37 || event.keyCode == 68 || event.keyCode == 39)
		astronave.velocitaRotazione = 0;
});