/**
 * INFORMATIONS GLOBALES DE CONFIGURATION DE L'APPLICATION
 * 
 * Derniere modif : 
 *  => MP - 2017.07.26 -- Ajout url directory coupontools (DESACTIVE) 
 * /
 */
//Version
var GLOBAL_appVersion="1.1.25_MONACA";

// BARCODE 
var GLOBAL_barcodeCache="";

// AUTHENTIFICATION - OPEN CART
var GLOBAL_authToken="";

//TURN ON OR OFF DEBUG MSG
var GLOBAL_Debug = true;
var GLOBAL_logserverURL = "https://dev.novacorp.fr/novacard_log/logger.php"
var GLOBAL_sendLogs = true;

//NOVACARD
//<!> DEPRECATED <!>
var GLOBAL_apiKey="z1U4RfK6PA2PY8Ajc1r0PbzFQX7HpaYmSPf04zGTZ61nfGgenbqQ88RcgScwa78qSBaOTokKjCEeylCk2rdTFTkK0A8cAiUnQbXcHGNaYt5qF44pRVyw8uO0FjG1n0UZUkP23wRycx1YxPvMT7zRZgPtWtU3Q1K6eutqg5pmRC18bHTMDTA6gEAq8YEuZh8TT1LJQhsGQFgEfsgySB31B1OJrYd7ZcMuyDGV14j8Tzmnr6FfsqFzJwknWiUlomvf";
var GLOBAL_apiName="MobileApp";
//<!> DEPRECATED <!>

var GLOBAL_serverBase = "https://dev.novacorp.fr/novacard/";
//var GLOBAL_serverBase = "https://orion.novacorp.fr/novacard/";
//Used for geolocation
var GLOBAL_eurofidBase = "https://dev.novacorp.fr/eurofid/";
//var GLOBAL_eurofidBase = "https://orion.novacorp.fr/eurofid/";

//Directory coupontools
var GLOBAL_couponDirectory = "https://couponapp.directory/index.php?dir=ywNgjMmTDVMKtKZF9ZHKa&cat=all&deviceid="; 

var GLOBAL_apiId="";

//<!>DEPRECATED<!>
var GLOBAL_credFilename = "Novacard_logon.json";
//<!> DEPRECATED <!>
//Alimenté par la fonction de login
var GLOBAL_credFilecontent = null;
var GLOBAL_credFileLength = 300;
var GLOBAL_loginRes = {success:false , msg:""} ;
var GLOBAL_device = {os:"FFox", version:"MPEROUMA", model:"MONACA", serial:"XXXX"};
var GLOBAL_cardList = [];
var GLOBAL_userData = null;
var GLOBAL_isLogged = false;


// GEOLOCATION
var GLOBAL_geoPosition = {longitude:null, latitude:null, accuracy:null, altitudeAccuracy:null, heading:null, speed:null, timestamp:null, Map:null};

function loaderOn() {
    logDebug("LoaderOn");
    var elem = $.find(".spinner");
    $(elem).removeClass("hidden");
}
function loaderOff() {
    logDebug("LoaderOff");
	var elem = $.find(".spinner");
    $(elem).addClass("hidden");
}

function populateDevice (){
    //console.log(device.cordova);
	//logDebug("Collect device info :");
	if(typeof device !== "undefined"){
	    GLOBAL_device.os = device.platform;
	    GLOBAL_device.version = device.version;
	    GLOBAL_device.model = device.model;
	    GLOBAL_device.serial = device.uuid;
	}
	else if(GLOBAL_device.serial.length == 0){
		var date = new Date(Date.now());
		//Cas ou le plugin device ne fonctionne pas
		GLOBAL_device.os = "UNKNOWN";
		GLOBAL_device.serial = date.getFullYear()+"." + 
		handleSingleDigit(date.getMonth()+1) + "."
        + handleSingleDigit(date.getDate()) + "."
        + handleSingleDigit(handleHours(date.getHours())) + 
        + handleSingleDigit(date.getMinutes()) + 
        + handleSingleDigit(date.getSeconds());
	}
    //logDebug(GLOBAL_device);
}


function getFormattedDate(format) {
    var date = new Date(Date.now()),
        formattedDate;

    formattedDate = date.getFullYear() + "-"
                  + handleSingleDigit(date.getMonth()+1) + "-"
                  + handleSingleDigit(date.getDate()) + " "
                  + handleSingleDigit(handleHours(date.getHours())) + ":"
                  + handleSingleDigit(date.getMinutes()) + ":"
                  + handleSingleDigit(date.getSeconds()) + " "
                  + (date.getHours() < 12 ? "AM" : "PM");

    return formattedDate;
}

// Prepends 0 to a single digit number.
function handleSingleDigit(num) {
    return (( num.toString().length === 1 ) ? "0" + num : num);
}


// Accepts an hour 0-23, returns 1-12
function handleHours(hours) {
    hours = (hours > 12 ? hours-12 : hours);
    if ( hours.toString() === "0" ) hours = "12";
    return hours;
}

function logDebug(message){
	//Pour une lecture des logs en local
    if(GLOBAL_Debug && !GLOBAL_sendLogs){
        var date = getFormattedDate();
        var callerName = "undefined";
        if(arguments.callee.caller != null)
            callerName = arguments.callee.caller.name;
        
        if(typeof message != "string"){
        	console.log("["+date+"]["+callerName+"] Objet passé : "+JSON.stringify(message));
        	
        }
        else{
        	console.log("["+date+"]["+callerName+"]"+message);
        }
    }
    
    if(GLOBAL_sendLogs){
    	//Send logs through an ajax async call
        var date = getFormattedDate();
        var callerName = "undefined";
        if(arguments.callee.caller != null)
            callerName = arguments.callee.caller.name;
        
    	populateDevice();
    	var device = GLOBAL_device.model+"_"+GLOBAL_device.os+"_"+GLOBAL_device.version;
    	var serial = GLOBAL_device.serial;
    	var msg = "";
    	if(typeof message != "string"){
        	msg="["+date+"]["+callerName+"]["+GLOBAL_appVersion+"] Objet passé : "+JSON.stringify(message);
        	
        }
        else{
        	msg="["+date+"]["+callerName+"]["+GLOBAL_appVersion+"]"+message;
        }
    	
    	//ASYNC AJAX CALL
    	var postData = {
    		"serial" : serial,
    		"device" : device,
    		"log": msg
    	};
		$.ajax({
			type : "POST",
			url : GLOBAL_logserverURL ,
			data : postData,
			success : function(data) {
			},
			error : function(error){
				
			},
			dataType : "html"
		});
    }
}
