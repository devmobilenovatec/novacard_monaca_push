/**
 * FONCTIONNALITES DE LECTURE ET D'EXPLOITATION DU CODE-BARRE
 * Attention, repose sur le plugin monaca mobi.monaca.plugins.BarcodeScanner
 * => https://docs.monaca.io/en/reference/third_party_phonegap/barcode_scanner/
 * 
 * Derniere modif : 
 *  => MP - 2016.12.12 -- Création du fichier 
 */
 
    
function scanBarcode() {
    $("#scanError").html("");
    loaderOn();
    
    // 2017.04.10 - Mise en place du nouveau workflow d'enrolement, pas de vérif si loggé
    //if( GLOBAL_loginRes.success){
        try{
            window.plugins.barcodeScanner.scan( 
                function(result) {
                    GLOBAL_barcodeCache=result.text;
                    if(GLOBAL_barcodeCache.length > 3){
                        setTimeout(processBarcode,500);
                    }
                    else{
                      $("#scanError").html("Code-barre non reconnu");
                      loaderOff();
                    }
                }, 
                function(error) {
                    $("#scanError").html("Erreur lors de la lecture du code-barre");
                    loaderOff();
                }
                //<!> There is an option that blocks the plugin execution on iOs <!>
                /*{
                  "preferFrontCamera" : true, // iOS and Android
                  "showFlipCameraButton" : true, // iOS and Android
                  "showTorchButton" : true, // iOS and Android
                  "disableAnimations" : true, // iOS
                  "prompt" : "Placer le code-barre au centre de la fenêtre", // supported on Android only
                  "formats" : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                  "orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device 
                }*/
            );
        }
        catch(e){
            logDebug("Erreur lors de l'utilisation du plugin :"+e.name);
            logDebug(e);
            switch(e.name){
                case "TypeError":
                default :
                    $("#scanError").html("Scan indisponible !");
                    break;
                
            }
            loaderOff();
        }
    //}
    /*else{
        //Utilisateur non connecté
        $("#scanError").html("Veuillez vous identifier !");
        appTab.setActiveTab(0);
        loaderOff();
    }*/
 }

/**
 * Fonction qui réalise les traitements postérieurs à la lecture du code barre
 * Fait appel à la fonction loadPage définie dans le fichier d'API actif (nomPlateformeAPI.js => openCartAPI.js par exemple)
 */
function processBarcode(){
    $("#scanError").html("");
    //Format du codeBarre <urlbase>/index.php?cardID=<numcard>
    console.log("Code barre lu: "+GLOBAL_barcodeCache);
    var argList = GLOBAL_barcodeCache.split("?")[1];
    
    //Retirer le dernier caractère
    //argList = argList.substring(0, argList.length - 1);
    //console.log("List arg: "+argList);
    
    var fData = new FormData();
    var numRezo = -1;
    var cardID = null;
    var typeTransac = null;
    
    $.each(argList.split("&"),function(){
        var kVal = this.split("=");
        fData.append(kVal[0],kVal[1]);
        
        if(kVal[0]=="r")
            numRezo = kVal[1];
            
        if(kVal[0]=="cardID")
            cardID = kVal[1];
        
        if(kVal[0]=="typeTransac")
            typeTransac = kVal[1];
    });
   
    //console.log("CardID: "+ cardID +" numRezo: "+numRezo);
    if(cardID == null ){
        //Cas de la recharge, pas de card id
        
        //Recharger les cartes utilisateurs
        loadCartes();
        
        //Si l'utilisateur possède une carte dans le réseau
        if(typeof GLOBAL_cardList[numRezo] !=="undefined"){
            
            //Par défaut, on prend la première carte du réseau en question pour ajouter la recharge
            if(typeof GLOBAL_cardList[numRezo][0] !== "undefined"){
                
                fData.append("numCarte",(GLOBAL_cardList[numRezo][0]).replace(/ /g,""));
                console.log("PROCESSBARCODE => "+GLOBAL_cardList[numRezo][0]);
                var destURL = GLOBAL_serverBase+"index.php?route=account/cartes/rechargement_ok&m=1";
                var opts={
                    url: destURL,
                    data: fData,
                    xhrFields: { withCredentials: true },
                    type: 'POST',
                    dataType:'json',
                    success: function(data2){
                        //console.log(data2);
                        if(data2.success){
                            //CAS OK
                            $("#scanError").html("Félicitations, votre recharge est comptabilisée !");
                            //Recharger la page des cartes
                            loadPage({destination:'consulter', credentials:true, local: true, divId:"#mescartes-body", timerAjust:3500});
                            appTab.setActiveTab(0);
                        }
                        else{
                            if(typeof data2.msg !== "undefined")
                                $("#scanError").html("Attention: " +data2.msg);
                            else
                                $("#scanError").html("Attention: " +data2.error_description);
                        }
                        loaderOff();
                    },
                    error: function(error){
                        //Retour à la page d'erreur
                        $("#scanError").html("Erreur recharge:"+error.responseText);
                        loaderOff();
                }};
                
                if(fData.fake) {
                    // Make sure no text encoding stuff is done by xhr
                    /*opts.xhr = function() { 
                        var xhr = jQuery.ajaxSettings.xhr(); 
                        console.log("FORM");
                        xhr.send = xhr.sendAsBinary; 
                        console.log(xhr);
                        return xhr; 
                    }*/
                    opts.contentType = "multipart/form-data; boundary="+fData.boundary;
                    opts.data = fData.toString();
                }
                
                try{
                    $.ajax(opts);
                }
                catch(e){
                    logDebug(e.message)
                    $("#scanError").html("Une erreur inconnue s'est produite, veuillez réessayer");
                    loaderOff();
                }
            }
            else{
                $("#scanError").html("Aucune carte disponible pour la recharge scannée !");
                loaderOff();                
            }
        }
        else{
            $("#scanError").html("Aucune carte disponible pour la recharge scannée !");
            loaderOff();
        }
    }
    else{
        if(typeTransac !== null){
            
            switch(parseInt(typeTransac)){
                case 97:
                    //Init
                default:
                    //Cas d'un ajout de carte
                    addCard(cardID);
                break;
            }
            
        }
        else{
          //Cas d'un ajout de carte
          addCard(cardID);    
        } 
    }
}