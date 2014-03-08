#!/usr/bin/env node

'use strict';
var fs       = require('fs'),
    path     = require('path'),
    colors   = require('colors'),
    optimist = require('optimist'),

    argv = optimist
		.usage('\nUsage: ' + process.argv[1].split('/').pop() + ' [options]')
		.alias('d', 'dir')
		.describe('d', 'specified path to capitalize first letter of the filenames')
		.alias('x', 'excluded')
		.describe('x', 'specified path to exclude in the process')
		.alias('v', 'verbose')
		.describe('v', 'print debugging message')
		.default ('d', process.cwd())
		.boolean('h')
		.alias('h', 'help')
		.describe('h', 'Help ')
		.argv,

excludedCount  = 0,
directoryCount = 0,
filesCount     = 0,
noChangesCount = 0,

isVerbose = function( string ) {
	if(argv.v) {
		console.log(string);
	}
},

isExcluded = function( string ) {

	var options = false;

	if(argv.x && (argv.x).replace(/\//g,'') === string ) {
		excludedCount += 1;
		options = true;
	}

	return options;

},

capitalFirstLetter = function(directory, oldName) {
	// define path location
	var oldPath = directory + oldName;
	var	processedFiles = '[ ' + oldPath + ' ] ';

	if ( oldName.charAt(0) === oldName.charAt(0).toUpperCase() ) {
		return false;
	}

    var newName = oldName.charAt(0).toUpperCase() + oldName.slice(1);

	fs.rename(oldPath, directory + newName, function ( err ) {
		if ( err ) {
			throw err;
		}
	} );

	processedFiles += oldName.red + ' ---> ' + newName.green;

	isVerbose( processedFiles );

	return newName;
},

getFileNames = function( dir )  {
    var files = fs.readdirSync(dir);

    for (var i in files) {

        var oldPath = dir + '/' + files[i];

        if (fs.statSync(oldPath).isDirectory()) {

			// exclude specified folder
			if( isExcluded( files[i] ) ) {
				continue;
			}

			// recursed if current files[i] is a directory
			getFileNames(oldPath);
			directoryCount += 1;

        } else {

			var directory = dir + '/';

			if ( !capitalFirstLetter(directory, files[i]) ) {
				isVerbose( '[' + directory + files[i] + ']' + ' No Changes made!'.yellow );
				noChangesCount += 1;
			}

			filesCount += 1;
        }
    }
};

if (argv.h || !argv.d) {
    console.log(optimist.help());
    return;
}

console.log('');
getFileNames(argv.d.toString());
console.log('');
console.log('');
console.log('= Summary Reports ='.grey);
console.log(('No. of Directories   : ' + directoryCount).grey);
console.log(('No. of Files         : ' + filesCount).grey);
console.log('---------------------------------------------'.grey);
console.log(('No. of Excluded Directories   : ' + excludedCount).yellow);
console.log(('No. of Affected Files         : ' + (filesCount - noChangesCount).toString()).green );
console.log('');