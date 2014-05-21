
var http = require('http');
var crypto = require('crypto');

var genesisBlockId = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
var exampleBlockId = '00000000000000001e8d6829a8a21adc5d38d0a473b144b6765798e61f98bd1d';
var testId = '0000000000000000456e808b29d5e0df86cd0c100c025699daef5a42176336c8';

getBlock(testId, display);

/**
 * Gets a block by id from block explorer and then calls callback on that block
 **/
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
 * Callback for getBlock. Prints information about block to screen.
 **/
function display(block)
{
	var tree = new MerkleTree(block);
	
	//Print merkle tree:
	console.log('Merkle Tree:');
	console.log('[');
	
	tree.merkleTree.forEach(function(buffer)
	{
		console.log(getBufferHexBE(buffer));;
	});
	
	console.log(']');	
	
	if(getBufferHexBE(tree.merkleRoot) == block.mrkl_root) console.log('Merkle Root correct.');
	
	var blockHash = computeBlockHash(block);
	var blockHashHex = getBufferHexBE(blockHash);
	console.log('Hash: ' + blockHashHex);
	if(blockHashHex == block.hash) console.log('Hash correct.');	
	
	function getBufferHexBE(buffer){
		return swapBufferEndian(buffer).toString('hex');
	}
}

/**
 * Performs in place byte reversal to swap endian
 **/
function swapBufferEndian(buffer)
{
	var len = buffer.length;
	var byteArray = [];
	for(var i = 1; i <= len; i++)
	{
		byteArray.push(buffer[len - i]);
	}
	return new Buffer(byteArray);
}

/**
 * Creates a Little endian buffer from a hexadecimal string
 **/
function hex2LEbuf(hex)
{
	var buffer = new Buffer(hex, 'hex'); 	
	return swapBufferEndian(buffer);
}

/**
 * Creates a Little endian buffer from a decimal
 **/
function dec2LEbuf(dec)
{
	var buffer = new Buffer(4); 
	buffer.writeUInt32LE(dec,0);		
	return buffer;
}

/**
 * Computes the Hash for the block
 **/
function computeBlockHash(block)
{			
	var version =  dec2LEbuf(block.ver),
    prevBlockHash =  hex2LEbuf(block.prev_block),
    rootHash = hex2LEbuf(block.mrkl_root),
    time = dec2LEbuf(block.time),
    bits = dec2LEbuf(block.bits),
    nonce = dec2LEbuf(block.nonce);	
	
	var headerBuffer = Buffer.concat([version, prevBlockHash, rootHash, time, bits, nonce]);	
	
	var hashBuffer = doubleHash(headerBuffer);	
	
	return hashBuffer;	
}

/**
 * Performs a double hash on input buffer.
 * Returns buffer. 
 **/
function doubleHash(buffer)
{	
	var hasher1 = crypto.createHash('sha256');
	var hasher2 = crypto.createHash('sha256');
	
	hasher1.update(buffer);	
	var hash1 = hasher1.digest();	
	hasher2.update(hash1);	
	var hash2 = hasher2.digest();
	return hash2;	
}

/**
 * Object to calculate the merkle tree of a block.
 **/
function MerkleTree(block)
{
	//Flat array of buffers containing the merkle tree
	var self = this;
	self.merkleTree = [];
	
	generateMerkleTree(block);
	
	//Buffer containing the merkle root
	this.merkleRoot = self.merkleTree.length > 0 ? self.merkleTree.slice(-1)[0] :'undefined'; 

	function generateMerkleTree(block)
	{
		var transactions = block.tx;			
		
		var row = formBottomRow(transactions);	
		
		do
		{	
			row = formNextRow(row);
		}
		while(row.length > 1);
			//self.merkleTree.push(row[0]);
	}

	/**
	 * Forms the bottom row of the merkle tree: 
	 * An array of Little Endian buffers, ensuring there are an even number of buffers.
	 **/
	function formBottomRow(transactions)
	{
		var row = [];
		for(var i = 0; i < transactions.length; i++)
		{
			var hashBuffer = swapBufferEndian((new Buffer(transactions[i].hash, 'hex')));				
			row.push(hashBuffer);
			self.merkleTree.push(hashBuffer);
		}
		//If there are an odd number of buffers, duplicate the last buffer:
		if(transactions.length % 2 == 1) {	
			row.push(hashBuffer);
			self.merkleTree.push(hashBuffer);
		}
		
		return row;
	}

	/**
	 * Takes the buffers from the previous row and computes 
	 * the buffers for the next row up
	 **/
	function formNextRow(previousRow)
	{
		var newRow = [];	
		for(var i = 0; i < previousRow.length; i+=2)
		{
			var left = previousRow[i],		
				right = previousRow[i + 1],
				concat = Buffer.concat([left, right]);	
				dHash =  doubleHash(concat);
			newRow.push(dHash);
			self.merkleTree.push(dHash);
		}
		
		//If there are an odd number of buffers, duplicate the last buffer:
		if(newRow.length > 1 && newRow.length % 2 == 1) {	
			newRow.push(dHash);
			self.merkleTree.push(dHash);
		}
		
		return newRow;
	}
}
