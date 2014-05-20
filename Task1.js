
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

/**
 * Converts a decimal to its 4 byte hexadecimal equivalent.
 **/
function dec2hex(i) 
{	
  // var hex = (i+0x00000).toString(16);
   var hex = (i).toString(16);
   paddedString = hex;
    if (paddedString.length < 8) {
        paddedString = ('00000000' + paddedString).slice(-8);
    } 
	//console.log('padded: ' +paddedString);
   return swapEndian(paddedString);
}

function hashBlock(block)
{	
	var version =  dec2hex(block.ver),
    prevBlockHash =  swapEndian(block.prev_block),
    rootHash = swapEndian(block.mrkl_root),
    time = dec2hex(block.time),
    bits = dec2hex(block.bits),
    nonce = dec2hex(block.nonce);	
	
	var headerHex = version + prevBlockHash + rootHash + time + bits + nonce;
	
	var hash = doubleHashHex(headerHex);
	
	console.log('HASH: ' + swapEndian(hash));	
}

/*
* Performs a double hash on input hexadecimal string
*/
function doubleHashHex(hex)
{
	var bin = (new Buffer(hex, 'hex')).toString('binary');
	
	var hasher1 = crypto.createHash('sha256');
	var hasher2 = crypto.createHash('sha256');
	
	hasher1.update(bin, 'binary');
	
	var hash1 = hasher1.digest('binary');
	
	hasher2.update(hash1, 'binary');
	
	var hash2 = hasher2.digest('hex');
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

