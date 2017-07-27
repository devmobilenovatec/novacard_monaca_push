/** TRIGGERS UTILISES SUR LA PAGE PRINCIPALE **/
function onDeviceReady(){
	logDebug("################# DEVICE IS READY");
    //Populate device info
    populateDevice();
    //For geolocation
    updateGeoPosition();
    //App version
    updateNumVers();
}

function updateNumVers(){
    //Plugin : https://github.com/whiteoctober/cordova-plugin-app-version
	$("#numvers").html("v"+GLOBAL_appVersion);
	//<!> Not supported on browser platform <!>
    //Activable only if cordova-plugin-app-version is added
    if(typeof cordova != "undefined"){
        cordova.getAppVersion.getVersionNumber(function(version){
        	GLOBAL_appVersion = version;
    		logDebug("NUMERO DE VERSION : "+GLOBAL_appVersion);
    		$("#numvers").html("v"+GLOBAL_appVersion);
    	});
    }

	
    //Attrapper l'année
    var d = new Date();
    $("#yearvers").html(d.getUTCFullYear());   
}

function keyTrigger( event ) {
  //https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent
 //Problème rencontré similaire à ici : http://stackoverflow.com/questions/13913834/weird-issue-with-phonegap-2-2-predictive-text-and-input-type-text-on-android
 // Solution possible : https://www.npmjs.com/package/cordova-plugin-keyboard
  logDebug("key:"+event.key+" "+event.charCode);
  var elem = document.activeElement;
  logDebug($(elem).prop('nodeName')+" X"+$(elem).val()+"X ");
  logDebug($(elem).html());
  //logDebug(event);
}


/**
 * Se déclenche lorsque le keyboard numérique est montré
 */
function keyBoardShow(){
	logDebug("[KEYBOARD] Show");
	appTab.set("animation","fade");
	appTab.set("hide-tabs",true);
}

/**
 * Se déclenche lorsque le clavier numérique est caché
 */
function keyBoardHide(){
	logDebug("[KEYBOARD] Hide");
	appTab.set("animation","fade");
	appTab.set("hide-tabs",false);
}

function numCardTrigger(){
    var numCarte = $("#numCarte").val().replace(" ","");
    logDebug("Numero de carte: "+numCarte);
}

/** TRIGGERS UTILISES SUR LA PAGE PRINCIPALE **/
function appTabTrigger(){
    logDebug("Trigger changement tab => Active tab "+appTab.getActiveTabIndex());
    switch(appTab.getActiveTabIndex()){
        case 0: 
            //Onglet mes cartes
            loaderOn();
            setTimeout(function(){
                if(GLOBAL_userData != null){
                    logDebug("Load cards");
                    //Charger les cartes existantes
                    //loadCartes();
                    //Timeout pour permettre que le popPage s'exécute
                    loadPage({destination:'consulter', credentials:true, local: true, divId:"#mescartes-body"});
                }
                else{
                    //Charger la page de login en page principale
                    loadPage({destination:'login',withCredentials: false, local: true,divId:'#mescartes-content'});
                }
            },500);
            break;
        //Scan Barcode
        case 1: 
            scanBarcode();
        break;
        
        case 2:
            //Enseignes
            var ensContent = $("#enseignes-content").html().trim(); 
            //logDebug("X"+ensContent+"X");
            if(ensContent.length==0){
                loadPage({destination:'enseignes', credentials:false, local:true, divId:'#enseignes-content', timerAjust:7000});
                loaderOn();
            }
            break;
        //Mon compte
        case 3: 
            loaderOn();
            updateNumVers();
            setTimeout(function(){
                if(GLOBAL_loginRes.success){
                    loadPage({destination:'profile', credentials:true});
                }else{
                    loadPage({destination:'register', credentials:false, force_logout: true});
                }
            },500);
        break;
         //Onglet Bon plans
        case 4:
           loaderOn();
           
           //APPEL DIRECTORY CTOOLS
           //Retrouver le device id
           populateDevice();
           var devId;
           if(typeof GLOBAL_device.serial != "undefined" ){
               devId = GLOBAL_device.serial;
           }
           else{
               //TODO : améliorer ce cas de figure
               devId = "UNKNOWN";
           }
           logDebug("[CTOOLS] DevId = "+devId+" <"+GLOBAL_device.serial+">");
           urlCouponDir = GLOBAL_couponDirectory+devId;
           logDebug("[CTOOLS] urlDir = "+urlCouponDir);
           
           //Appel dans la frame
           $("#bonplan-frame").attr("src",urlCouponDir);
           
           //OLD
            //setTimeout(function(){
            //    if(GLOBAL_loginRes.success){
            //        loadPage({destination:'bonplan', credentials:true, local:true, divId:'#bonplan-content'});
            //    }else{
            //Chargement page enregistrement
            //loadPage({destination:'register', credentials:false, force_logout: true, local:true, divId:'#bonplan-content'});        
            //    }
            //},500);
            
        break;
        default:
            //logDebug("TABCHANGE:"+appTab.getActiveTabIndex());
        break;
    }
}

function initTrigger(event) {
    var page = event.target;
    //https://github.com/angular/angular.js/issues/7981
    //logDebug("Trigger init => evenement angular "+page.ng339);
    try{
        if (page.matches('#login-page')) {
            //Déclencher le chargement des informations de login
            //loadLogin('2');
        }
        if (page.matches('#main-page')) {
            //Déclencher l'autoLogin
            loaderOn();
            //Préféré à l'auto-login
            loadLogin('');
            //SilentLogin fonctionne mais pb de loader
            //setTimeout(silentLogin,500);
            //A commenter si silentLogin activé
            //Chargement du formulaire de login
            //setTimeout(function(){loadPage({destination:'login', credentials:false, local:true, divId:'#mescartes-content'})},500);
            //Déclencher le chargement des enseignes
            loadPage({destination:'enseignes', credentials:false, local:true, divId:'#enseignes-content', timerAjust:7000});
        }
    }catch(e){
    	//Versions d'android antérieures à la 5.0
         if (e.name == 'TypeError'){
            logDebug("[ATTENTION] Votre version d'android ou d'Ios peut présenter des incompatibilités avec l'application ");
            logDebug("[ATTENTION] Silent Login indisponible");
            logDebug("[ATTENTION] Tentative de chargement des credentials");
        	loaderOn();
            //Préféré à l'auto-login
            loadLogin('');
            if(page.ng339 == 16){
            	logDebug("[ATTENTION] Chargement pages");
                setTimeout(function(){loadPage({destination:'login', credentials:false, local:true, divId:'#mescartes-content'})},500);
                $("#login-msg").attr("class","danger bg-danger");
                $("#login-msg").html("Attention, votre système n'est pas pleinement compatible avec l'application.");
                //Déclencher le chargement des enseignes
                loadPage({destination:'enseignes', credentials:false, local:true, divId:'#enseignes-content', timerAjust:7000});
            }
            else{
            }
            return -1;
         }
    }
}

function keyTrigger( event ) {
  //https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent
 //Problème rencontré similaire à ici : http://stackoverflow.com/questions/13913834/weird-issue-with-phonegap-2-2-predictive-text-and-input-type-text-on-android
 // Solution possible : https://www.npmjs.com/package/cordova-plugin-keyboard
  logDebug("key:"+event.key+" "+event.charCode);
  var elem = document.activeElement;
  logDebug($(elem).prop('nodeName')+" X"+$(elem).val()+"X ");
  logDebug($(elem).html());
  //logDebug(event);
}


/**
 * Se déclenche lorsque le keyboard numérique est montré
 */
function keyBoardShow(){
	logDebug("[KEYBOARD] Show");
	appTab.set("animation","fade");
	appTab.set("hide-tabs",true);
}

/**
 * Se déclenche lorsque le clavier numérique est caché
 */
function keyBoardHide(){
	logDebug("[KEYBOARD] Hide");
	appTab.set("animation","fade");
	appTab.set("hide-tabs",false);
}

function numCardTrigger(){
    var numCarte = $("#numCarte").val().replace(" ","");
    logDebug("Numero de carte: "+numCarte);
}

/**
 * Fonction utilisée pour les boites de dialogue
 * @param tit: titre de la fenêtre
 * @param msg: message à passer (raw text)
 * @param mod: nom de la classe de style à apposer,
 * @param okLabel: label du bouton OK
 * @param okCallback : function de callBack pour le cas où l'utilisateur clique sur OK
 * @param cancelCallback : function de callBack pour le cas où l'utilisateur clique sur OK
*/
function dialogBox(tit, msg, mod, okLabel, okCallback, cancelCallback, argOK, argCancel) {
    ons.notification.confirm({
      title: tit,
      message: msg,
      modifier: mod,
      buttonLabels: ["Annuler", okLabel],
      callback: function(idx) {
        switch (idx) {
          case 0:
            //En cas d'appui sur Cancel  
            if(typeof cancelCallback !='undefined' && cancelCallBack!=null )
                cancelCallback(argCancel);
            break;
          case 1:
            //En cas d'appui sur OK
            if(typeof okCallback !='undefined')
                okCallback(argOK);
            break;
        }
      }
    });
  }
  
  /**
   * La même chose, mais avec les alertes uniquement
   */
  function alertBox(tit, msg, mod, okLabel) {
    ons.notification.alert({
      title: tit,
      message: msg,
      modifier: mod,
      buttonLabel: okLabel
    });
  }

