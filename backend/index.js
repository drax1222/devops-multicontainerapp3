// Dostępne policy dla restartu w docker-compose.yml
// AKTUALNIE USTAWIONE : on-failure
// always -- nawet przy kodzie 0 wstanie ponownie
// on-failure -- przy kodach innych niż 0 kontener wstanie
// "no" -- olej restartowanie

const express = require("express");
const redis = require("redis");
const process = require("process");
const keys = require("./keys");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();

app.use(cors());
app.use(bodyParser.json());
console.log(keys);

const pgClient = new Pool({
	user: keys.pgUser,
	host: keys.pgHost,
	databse: keys.pgDatabase,
	password: keys.pgPassword,
	port: keys.pgPort
});
const client = redis.createClient(
{
	host: keys.redisHost,
	port: keys.redisPort
});

app.get('/', (r,s)=>{
	s.send('HELLO THERE OBIVAN KENUBI');

});

pgClient.on('error', ()=> console.log('NO PG CONNECTION '));
pgClient.query('create table if not exists distances(p1x decimal,p1y decimal,p2x decimal, p2y decimal, result decimal)').catch(err => console.log(err));

client.set('counter', 0);



function nwd(a,b){
	while(b!==0){
		var c = a%b;
		a = b;
		b = c;
	}
	return a;
}

app.get('/clearredis', (r,s)=>{
	client.flushall();

});

 app.get('/pointsdistance/:P1/:P2', (r,s)=>{
	var P1 = r.params.P1;
	var P2 = r.params.P2;
	let p1x = parseFloat(P1.split(',')[0]);
	let p1y = parseFloat(P1.split(',')[1]);
	let p2x = parseFloat(P2.split(',')[0]);
	let p2y = parseFloat(P2.split(',')[1]);

	client.get(`${p1x}${p1y}${p2x}${p2y}`, async (e, res) =>{
		if(res !== null){
			console.log('GETTING DATA FROM REDIS');
			s.send({Distance: res, Source: 'Redis'});
		}
		else{
			pgClient.query(`SELECT result from distances where p1x=${p1x} and p1y=${p1y} and p2x=${p2x} and p2y=${p2y}`, (err, res) => {
				if(res && res.rows.length > 0){
					console.log('GETTING DATA FROM PSQL');
					s.send({Distance: res.rows[0].result, Source: 'PSQL'});
				}
				else{
					console.log('CALCULATING AND SAVING NEW DATA');
					var newRes = Math.sqrt(Math.pow(p2x-p1x, 2) + Math.pow(p2y-p1y,2));
					client.set(`${p1x}${p1y}${p2x}${p2y}`, newRes);
					pgClient.query(`insert into distances values(${p1x},${p1y},${p2x},${p2y},${newRes})`);
					
					
					s.send({Distance: newRes, Source: 'Nowy wpis'});
				}
			  });
		}		
	});
	
});
app.get('/nwd/:A/:B', (r,s) => {	
	var L1 = parseInt(r.params.A);
	var L2 = parseInt(r.params.B);	
	var lower = L1 < L2 ? L1: L2;
	var higher = L1 > L2 ? L1: L2;	
	client.get(`${lower}${higher}`, (e, res) =>{
		if(res !== null){
			s.send('WYNIK Z PAMIĘCI REDISA:' + res);
		}
		else{
			var result = nwd(lower,higher);
			s.send('NOWY WYNIK NWD:' + result + 'dla liczb:' + lower + ' i ' + higher);
			client.set(`${lower}${higher}`, result);
		}		
	});
});

app.get('/shutdown', (rq, rs)=>{
	//without restart (jeśli policy ustawione na on-failure)
	process.exit(0);
});
app.get('/simulateerror', (rq, rs)=>{
	// with restart
	process.exit(1);
});

app.get('/currentcounter', (req, res) => {
	client.get('counter', (err,c) => {
		res.send('Counter:'+ c);
		client.set('counter', parseInt(c)+1);
	});
});

const port = 5000;
app.listen(port, ()=> {
	console.log(`Listening on port: ${port}`);
});