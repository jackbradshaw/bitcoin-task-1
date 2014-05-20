
var http = require('http');
var crypto = require('crypto');

var genesisBlockId = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
var exampleBlockId = '00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d';

getBlock(genesisBlockId, hashBlock);

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

/**
 * Performs in place byte reversal to swap endian
 **/
function swapBufferEndian(buffer)
{
	var  start = 0, end = buffer.length - 1;
	while( start < end)
	{
		var temp = buffer[start];
		buffer[start] = buffer[end];
		buffer[end] = temp;
		start++;
		end--;
	}
}

function hex2LEbin(hex)
{
	var buffer = new Buffer(hex, 'hex'); 
	swapBufferEndian(buffer);
	return buffer.toString('binary');
}

function dec2LEbin(dec)
{
	var buffer = new Buffer(4); 
	buffer.writeUInt32LE(dec,0);	
	//console.log(buffer);
	return buffer.toString('binary');
}

function hashBlock(block)
{		
	var version =  dec2LEbin(block.ver),
    prevBlockHash =  hex2LEbin(block.prev_block),
    rootHash = hex2LEbin(block.mrkl_root),
    time = dec2LEbin(block.time),
    bits = dec2LEbin(block.bits),
    nonce = dec2LEbin(block.nonce);	
	
	var headerBin = version + prevBlockHash + rootHash + time + bits + nonce;
	
	var hash = doubleHashBin(headerBin);
	
	//load into to buffer so we can convert back to big endian:
	var buffer = new Buffer(hash, 'binary');
	swapBufferEndian(buffer);
	
	console.log('HASH: ' + buffer.toString('hex'));		
}

/*
* Performs a double hash on input binary string.
* Returns binary string. 
*/
function doubleHashBin(bin)
{	
	var hasher1 = crypto.createHash('sha256');
	var hasher2 = crypto.createHash('sha256');
	
	hasher1.update(bin, 'binary');
	
	var hash1 = hasher1.digest('binary');
	
	hasher2.update(hash1, 'binary');
	
	var hash2 = hasher2.digest('binary');
	return hash2;	
}

function calulateMerkleRoot(block)
{
	
}

function formBottomRow(transactions)
{
	
}

function formNextTreeRow(previousRow)
{
	
}

