
var http = require('http');
var crypto = require('crypto');

var genesisBlockId = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
var exampleBlockId = '00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d';

getBlock(exampleBlockId, hashBlock);

function swapEndian(hex)
{	
	var output = '';
	var count  = hex.length;
	for(var i = 2; i <= count; i+=2)
	{
		output += hex[count - i] + hex[ 1 + count - i];
	}	
	return output;
}

function getBlock(blockId, callback)
{
	var location = 'http://blockexplorer.com/rawblock/' + blockId;
	http.get(location, function(res)
	{
		var body = '';

		res.on('data', function(chunk) {
			body += chunk;
		});

		res.on('end', function() {
			var blockResponse = JSON.parse(body)
			callback(blockResponse);
		});
	});	
}

function dec2hex(i) 
{	
   var hex = (i+0x00000).toString(16);
   
   paddedString = hex;
    if (paddedString.length < 8) {
        paddedString = ('00000000' + paddedString).slice(-8);
    } 
	//console.log('padded: ' +paddedString);
   return swapEndian(paddedString);
}

function hex2bin(hex)
{	
	var
    bytes = [],
    str;

	for(var i=0; i< hex.length-1; i+=2){
		bytes.push(parseInt(hex.substr(i, 2), 16));
	}

	str = String.fromCharCode.apply(String, bytes);
	
	return str;
}

function hashBlock(block)
{	
	var version =  dec2hex(block.ver),
    prevBlockHash =  swapEndian(block.prev_block),
    rootHash = swapEndian(block.mrkl_root),
    time = dec2hex(block.time),
    bits = dec2hex(block.bits),
    nonce = dec2hex(block.nonce);
	
	/*
	var version =  '01000000',
    prevBlockHash = '81cd02ab7e569e8bcd9317e2fe99f2de44d49ab2b8851ba4a308000000000000',
    rootHash = 'e320b6c2fffc8d750423db8b1eb942ae710e951ed797f7affc8892b0f1fc122b',
    time = 'c7f5d74d', 
    bits = 'f2b9441a',
    nonce = '42a14695';
	*/
	
	var headerHex = version + prevBlockHash + rootHash + time + bits + nonce;

	//console.log(headerHex);
	
	var hasher1 = crypto.createHash('sha256');
	var hasher2 = crypto.createHash('sha256');	
	
	hasher1.update(hex2bin(headerHex), 'binary');
	var hash1 = hasher1.digest('binary');
	
	hasher2.update(hash1, 'binary');
	var hash2 = hasher2.digest('hex');
	console.log('HASH: ' + swapEndian(hash2));	
}