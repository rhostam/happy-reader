'use strict';

app.service('FileReader', function($rootScope) {
    var LineByLineReader = require('line-by-line');
    var CSVSniffer = require("csv-sniffer")();
    var S = require('string');

    var lr;
    var path = "";
    var header = [];
    var lines = [];
    var sniffResult;
    var parseAttrs = {};
    var fileChecked = false;
    var validFile = false;

    this.isFileChecked = function(){
        return fileChecked;
    };
    this.isFileValid = function(){
        return validFile;
    };
    this.setPath = function (p){
        path = p;
        this.checkFile();
    };
    this.getPath = function (){
        return path;
    };
    this.getNumOfRecords = function(){
        //TODO: (lines.length - 1) if hasHeader, otherwise (lines.length)
        console.log("getNumOfRecords(): " + (lines.length - 1));
        return lines.length - 1;
    };
    this.getHeader = function(){
        return header;
    };
    this.getLine = function(i){
        console.log("getLine(" + i + ")");
        return lines[i];
    };
    this.getSlice = function(start, end){
        console.log("getSlice(" + start + "," + end + ")");
        return lines.slice(start, end);
    };
    this.parseLine = function(line){
        return S(line).parseCSV(parseAttrs.delim, parseAttrs.quoteChar, parseAttrs.quoteChar, parseAttrs.rowDelim)[0];
    };
    this.parseLines = function(lines){
        var output = [];

        for(var i = 0; i < lines.length; i++){
            //console.log(lines[i]);
            output.push(S(lines[i]).parseCSV(parseAttrs.delim, parseAttrs.quoteChar, parseAttrs.quoteChar, parseAttrs.rowDelim)[0]);
        }

        //console.log("parseLines(" + lines + "): " + output);

        return output;
    };
    this.checkFile = function(){
        lr = new LineByLineReader(path, {skipEmptyLines: true});
        var sniffer = new CSVSniffer();
        var sampleLines = "";
        var lineNr = 0;

        lr.on('error', function (err) {
            // 'err' contains error object
        });

        lr.on('line', function (line) {
            // pause emitting of lines...
            lr.pause();

            lineNr += 1;
            lines.push(line);
            //console.log(line);
            //console.log(lineNr);

            lr.resume();
        });

        lr.on('end', function () {
            if(lineNr > 1){
                sampleLines = lines[0] + "\n" + lines[1] + "\n";
                //TODO: try and catch this to see if file is valid
                sniffResult = sniffer.sniff(sampleLines);
                console.log("Sniff result: "+
                    "Newline string: "              +sniffResult.newlineStr+
                    "Delimiter: "                   +sniffResult.delimiter+
                    "Quote character: "             +sniffResult.quoteChar+
                    "First line contains labels: "  +sniffResult.hasHeader+
                    "Labels: "                      +sniffResult.labels+
                    "# Records: "                   +sniffResult.records.length
                );

                fileChecked = true;
                validFile = true;
            }

            if(sniffResult){
                parseAttrs.delim = sniffResult.delimiter;
                parseAttrs.rowDelim = sniffResult.newlineStr;
                parseAttrs.quoteChar = sniffResult.quoteChar;

                //Check if file has header, otherwise assign generic header
                if(sniffResult.hasHeader){
                    header = sniffResult.labels;
                }else{
                    var sampleLine = this.parseLine(lines[0]);

                    for(var i = 0; i < sampleLine.length; i++){
                        header.push("Field1");
                    }
                }
            }

            if(validFile){
                console.log("file valid and closed.");
                $rootScope.$broadcast('fileChecked');
                $rootScope.$digest();
            }else{
                console.log("file not valid and closed.");
            }
        });
    };
    this.closeFile = function(){
        path = "";
        header = [];
        lines = [];
        sniffResult = {};
        parseAttrs = {};
        fileChecked = false;
        validFile = false;
    };
});