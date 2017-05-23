/**
 * INFORMATIONS GLOBALES DE CONFIGURATION DE L'APPLICATION
 * 
 * Derniere modif : 
 *  => MP - 2017.01.30 -- Première release 
 * /
 */
// BARCODE 
var GLOBAL_barcodeCache="";

// AUTHENTIFICATION - OPEN CART
var GLOBAL_authToken="";

//IDCADO
//var GLOBAL_apiKey="4q5FqOWcVreulepcykW6rcHWGTaK46S5CTomlTtjE0I3MPpzeFgOWBRsUc4GhPdhAncKUtRO6Lkijf6BuPeqt4RqzLI1YQxVBmPhCKKsb8RwWtEH1Y43HmDx2EQWcNot26k4kN6wDwYp1i5pY1p3CMEJGS6oN8FZcXhpIz8Z3P6td4JCmuH11sRc1uNdtvvTKt2hUfctKi0jIbzcKISJwfekQDMweykWmfCeWHd6YC4JlhZV7Qlaw4MrsYC7VTy5";
//var GLOBAL_apiName="MobileApp";
//var GLOBAL_serverBase = "https://dev.novacorp.fr/idcado_dev/";

//NOVACARD
var GLOBAL_apiKey="z1U4RfK6PA2PY8Ajc1r0PbzFQX7HpaYmSPf04zGTZ61nfGgenbqQ88RcgScwa78qSBaOTokKjCEeylCk2rdTFTkK0A8cAiUnQbXcHGNaYt5qF44pRVyw8uO0FjG1n0UZUkP23wRycx1YxPvMT7zRZgPtWtU3Q1K6eutqg5pmRC18bHTMDTA6gEAq8YEuZh8TT1LJQhsGQFgEfsgySB31B1OJrYd7ZcMuyDGV14j8Tzmnr6FfsqFzJwknWiUlomvf";
var GLOBAL_apiName="MobileApp";
var GLOBAL_serverBase = "https://dev.novacorp.fr/novacard/";
//var GLOBAL_serverBase = "https://orion.novacorp.fr/novacard/";
//Used for geolocation
var GLOBAL_eurofidBase = "https://dev.novacorp.fr/eurofid-preprod/";
//var GLOBAL_eurofidBase = "https://orion.novacorp.fr/eurofid/";


var GLOBAL_apiId="";


var GLOBAL_credFilename = "Novacard_logon.json";
//Alimenté par la fonction de login
var GLOBAL_credFilecontent = null;
var GLOBAL_credFileLength = 300;
var GLOBAL_loginRes = {success:false , msg:""} ;
var GLOBAL_device = {os:"", version:"", model:""};
var GLOBAL_cardList = [];
var GLOBAL_userData = null;


// GEOLOCATION
var GLOBAL_geoPosition = {longitude:null, latitude:null, accuracy:null, altitudeAccuracy:null, heading:null, speed:null, timestamp:null, Map:null};

//TURN ON OR OFF DEBUG MSG
var GLOBAL_Debug =1;


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
    GLOBAL_device.os = device.platform;
    GLOBAL_device.version = device.version;
    GLOBAL_device.model = device.model;
    logDebug(GLOBAL_device);
}

function updateNumVers(){
    //En attendant les bons plugins cordova (pas dans le répo de base monaca)
    //Fait "dirty" à la main
    //So NasTy
    $("#numvers").html("v1.1.9");
    $.get("../config.xml",function(data){
        //console.log(data);
        var wid=$(data).find("widget");
        console.log($(wid).attr("version"));
        if(typeof $(wid).attr("version") !== "undefined" )
            $("#numvers").html($(wid).attr("version"));
        else
            $("#numvers").html("v1.1.10");
    })
    
    //Attrapper l'année
    var d = new Date();
    $("#yearvers").html(d.getUTCFullYear());
    //K.O.B Aventura
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
    if(GLOBAL_Debug){
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
}
