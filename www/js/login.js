/**
 * Fonctions globales liées à la gestion 
 * de l'authentification
 * 
 * Date der modif : 2016-12-27 
 */
 
 
 /**
  * Pour les codes d'erreur, se référer à https://docs.monaca.io/en/reference/cordova_5.2/file/
  */
 /*function fsErrorCallback(error){
   var msg = '';

  switch (error.code) {
   
    case 1:
      msg = 'NOT_FOUND_ERR';
      break;
    case 2:
      msg = 'SECURITY_ERR';
      break;
    case 6:
      msg = 'NO_MODIFICATION_ALLOWED_ERR';
      break;
    case 7:
      msg = 'INVALID_STATE_ERR';
      break;
    case 8:
      msg = 'SYNTAX_ERR';
      break;
    case 9:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case 10:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case 12:
      msg = 'PATH_EXISTS_ERR';
      break;
    default:
      msg = 'Unknown Error '+error.code;
      break;
   };

   logDebug('Error: ' + msg);
   //Charger la page de login par défaut
   setTimeout(function(){
        loadPage({
            destination:'login',
            withCredentials: false,
            local: true,
            divId:'#mescartes-content'
        });
    },500);
   loaderOff();
 }*/
 
 /**
  * Fonction qui vérifie s'il y a déjà au moins un profil stocké
  */
 function getProfilesLS(){
	 logDebug("Vérification des profils enregistrés");
	 var storage = window.localStorage;
	 var availableProfiles =[];
	 
	 for ( var i = 0, len = storage.length; i < len; ++i ) {
		  availableProfiles[i] = storage.getItem( storage.key( i ) );
	 }
	 logDebug(availableProfiles.length+" profil(s) trouvés ") 
	 return availableProfiles;
 }
 
 /**
  * Fonction qui utilise le localStorage pour lire le dernier profil utilisé
  */
 function readLoginLS(profileNumber){
     logDebug("Recherche du profil :"+profileNumber);
     var profEntry = profileNumber;
     var storage = window.localStorage;
     if(profileNumber==null){
         profileNumber="last";
     }
     var credentials=null;
     var sData = storage.getItem(profileNumber);
     if (sData != null){
        logDebug ("Profil trouvé :"+sData);
        return JSON.parse(sData);
     }
     else{
        logDebug ("Aucune donnée trouvée !");
        return null;
     }
 }
 
 /**
  * Fonction qui écrit les informations de login dans le localStorage, met à jour last par défaut
  */
 function writeLoginLS(username, password){
     var profEntry = username;
     var storage = window.localStorage;
     var loginChain = JSON.stringify({user:username, pass:password});
     
     logDebug("Enregistrement du profil :"+profEntry+" "+loginChain);
     storage.setItem(profEntry, loginChain);
     //Mettre à jour le dernier login utilisé
     if(profEntry != "last"){
         logDebug("Mise à jour du dernier profil utilisé :"+profEntry+" "+loginChain);
         storage.setItem("last", loginChain);
     }
 }
 
 /** 
  * Fonction qui lit les informations de login depuis un fichier local passé en paramètre
  * DEPRECATED, NOT COMPATIBLE WITH ALL ANDROID AND IOS VERSIONS
  */ 
 /*function readLogin(fileName){
    
    var type = window.TEMPORARY;
    var size = 500*1024; //(100 Koctets)
     
     window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem; 
     window.requestFileSystem(type, size, 
     function (fs){
         //Case of success
         fs.root.getFile(fileName, {},
         function(fileEntry){
            //Creation OK 
            fileEntry.file(function(file){
                var reader = new FileReader();
                reader.onloadend = function (e){
                    try{
                        GLOBAL_credFilecontent = JSON.parse(this.result);
                    }
                    catch(e){
                        logDebug("Erreur lors de la lecture du fichier de credentials");
                        return -1;                        
                    }
                    if(this.result.length>0){
                        logDebug("Fichier "+fileName+" chargé !");
                        logDebug("Contenu : \n"+this.result);
                    }
                    else{
                        logDebug("Erreur lors de la recuperation du contenu du fichier de credentials");
                        return -1;
                    }
                }
                reader.readAsText(file);
            },fsErrorCallback);
         },
         fsErrorCallback);
     },
     fsErrorCallback);
    
    return GLOBAL_credFilecontent;
 }*/
 
 /**
  * Fonction qui réalise l'authentification en back
  */ 
 function silentLogin(){

    //try{
        //readLogin(GLOBAL_credFilename);
        GLOBAL_credFilecontent=readLoginLS("last");
    //}
    /*catch(e){
           logDebug("La fonctionnalité de login automatique n'est pas disponible sur votre appareil");
           //Charger la page de login en page principale
            setTimeout(function(){
                loadPage({
                    destination:'login',
                    withCredentials: false,
                    local: true,
                    divId:'#mescartes-content'
                });
            },500);
           
           return -1;
    }*/

    setTimeout(function(){
        if(typeof GLOBAL_credFilecontent !== "undefined"){
            logDebug("SILENT LOGIN : "+GLOBAL_credFilecontent.user+" "+GLOBAL_credFilecontent.pass);
            loginF(GLOBAL_credFilecontent.user,GLOBAL_credFilecontent.pass, postLogin);
        }
    }, 500);
    return 0;
 }
 
 
 /**
  * Fonction qui remplit automatiquement les champs login 
  * et mot de passe à partir des données enregistrées en local
  * Repose sur le plugin http://ngcordova.com/docs/plugins/file/
  * https://www.html5rocks.com/en/tutorials/file/filesystem/
  * => on va utiliser le système de fichiers temporaire
  */ 
 function loadLogin(complement){
    logDebug("Loading login info");
    var fileContent = null;
    loaderOn();
    GLOBAL_credFilecontent = readLoginLS("last");
   
    setTimeout(function(){
   
    	if(GLOBAL_credFilecontent !== null){
            	//Cacher les champs de login / mdp
            	$("#login-form"+complement+" h3").html("");
            	$("#login"+complement).attr("type","hidden");
            	$("#password"+complement).attr("type","hidden");
            	$("#login"+complement).attr("style","display:none !important");
            	$("#password"+complement).attr("style","display:none !important");
                $("#login"+complement).val(GLOBAL_credFilecontent.user);
                $("#password"+complement).val(GLOBAL_credFilecontent.pass);
                $("#login-profile-name").html(GLOBAL_credFilecontent.user)
                //Afficher le champ d'input joli
                $("#login-profile").attr("class","");
                //Changer les boutons du bas
                $("#login-forgotten"+complement).html("<span>Changer d'utilisateur</span>");
                $("#login-forgotten"+complement).attr("onclick","appNav.pushPage('login');");
                $("#login-recall").remove();
                $("#login-submit").attr("style","margin-left:0 !important");
            }else{
            	logDebug("[LOGIN] Impossible de trouver les informations de login");
            	$("#login-msg"+complement).attr("class","text-info bg-info");
                $("#login-msg"+complement).html("Veuillez saisir votre identifiant<br/> et votre mot de passe");
            }
        loaderOff();
    }, 500);
    return 0;
 }
 
 /**
  * A chaque login reussi, fonction qui stocke les informations
  * de connexion pour la prochaine tentative
  * => OK 2016.12.29
  * => DEPRECATED 2017.04.07 
  */ 
 /*function saveLogin(username,password){
     var fileName="Novacard_logon.json";
     var logArr= {user:username, pass:password};
     //Create file and write inside
     var type = window.TEMPORARY;
     var size = 500*1024; //(100 Koctets)
     
     window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
     try{
     //Réecriture du fichier
     window.requestFileSystem(type, size, 
     function (fs){
         //Case of success
         fs.root.getFile(fileName, {create: true},
         function(fileEntry){
            //Creation OK 
            //logDebug("Creation fichier OK "+fileName);
            fileEntry.createWriter(function(fileWriter){
                fileWriter.onwriteend = function (e){
                    //logDebug("Fin d'ecriture du fichier "+fileName);
                }
                fileWriter.onerror = function (e){
                    //logDebug("Erreur survenue lors de l'ecriture de "+fileName);
                }
                
                //Problème sur le constructeur de Blob pour certaines versions d'Android => Illegal constructor
                //http://stackoverflow.com/questions/18596005/generate-client-side-pdf-with-jspdf-on-phonegap-based-apps
                var blob;
                var loginChain = JSON.stringify(logArr);
                while(loginChain.length<GLOBAL_credFileLength){
                    loginChain+=' ';
                }
                
                try  
                {
                    blob= new Blob([loginChain], {type: 'text/plain' });
                    //logDebug("Blob => cas 1");
                }
                catch (e)  
                {
                    window.BlobBuilder = window.BlobBuilder ||
                                   window.WebKitBlobBuilder ||
                                      window.MozBlobBuilder ||
                                      window.MSBlobBuilder;
                    if (e.name == 'TypeError' && window.BlobBuilder)  
                    {
                        var bb = new BlobBuilder();
                        bb.append(loginChain);
                        blob = bb.getBlob("text/plain");
                        //console.debug("Blob => cas 2");
                    }
                    else if (e.name == "InvalidStateError")  
                    {
                         // InvalidStateError (tested on FF13 WinXP)
                         blob = new Blob([loginChain], {type: "text/plain"});
                         //console.debug("Blob => case 3");
                    }
                    else  
                    {
                        // We're screwed, blob constructor unsupported entirely   
                        //console.debug("Blob construction not supported");
                    }
                }
                fileWriter.write(blob);
            },fsErrorCallback);
         },
         fsErrorCallback);
     },
     fsErrorCallback);
     }
        catch(e){
            if (e.name == 'TypeError'){
               loaderOff();
               logDebug("Erreur de compatibilité lors de l'enregistrement des credentials");
               return -1;
            }
            else{
                loaderOff();
                logDebug("Erreur de chargement des credentials "+e.name);
                return -1;
            }
    }
     
 }*/
 
 //Fonction qui réalise l'authentification à proprement parler
 function login(complement){
    var username=$("#login"+complement).val();
    var password=$("#password"+complement).val(); 
    logDebug("TENTATIVE LOGIN :"+username+" "+password);
    loaderOn();
    setTimeout(function(){
        loginF(username,password,postLogin);
    },500);
    //logDebug(GLOBAL_loginRes);    
}

//Fonction exécutée lorsque l'appel AJAX est terminé
function postLogin(){
    logDebug("POSTLOGIN");
    if(GLOBAL_loginRes.success){
        //saveLogin(GLOBAL_userData["username"],GLOBAL_userData["password"]);
        writeLoginLS(GLOBAL_userData["username"],GLOBAL_userData["password"]);
        logDebug("POSTLOGIN : connection acceptée");
        $("#login-msg").attr("class","success bg-success");
        $("#login-msg").html(GLOBAL_loginRes.msg);
        //logDebug(GLOBAL_userData);
        showPrivateIcons();
        setTimeout(function(){
            if(GLOBAL_userData != null){
                logDebug("LOGIN : Load cards");
                //Charger les cartes existantes
                //loadCartes();
                //Timeout pour permettre que le popPage s'exécute
                loadPage({destination:'consulter', credentials:true, local: true, divId:"#mescartes-body", animation:'fade', timerAjust:3500});
            }
        },500);
        //Utile lorsque l'on se connecte depuis la page de login
        //Sinon pop d'une pile vide (warning dans les logs)
        var pLength = appNav.pages.length;
        //logDebug("Page stack length :"+pLength);
        if(pLength>1)
            appNav.popPage();
    }
    else{
        logDebug("POSTLOGIN : echec de connection");
        $("#login-msg").attr("class","danger bg-danger");
        $("#login-msg").html(GLOBAL_loginRes.msg);
        $("#login-msg2").attr("class","danger bg-danger");
        $("#login-msg2").html(GLOBAL_loginRes.msg);
        //setTimeout(function(){loadPage({destination:'register', credentials:true, local: true, divId:"#mescartes-content"});},500);
        hidePrivateIcons();
        loaderOff();
    }
}

 //permet de se déconnecter
 function logout(){
     GLOBAL_loginRes.success=false;
     GLOBAL_userData = null;
     loaderOn();
     loadPage({destination:'logout', credentials:true, 'silent':true});
     hidePrivateIcons();
     //appNav.pushPage('login');
 }

  //Affiche les icones
  function showPrivateIcons(){
    $(".button--private").each(function(index,value){
        $(this).attr("style","visibility:visible");
    });  
    
    $(".button--public").each(function(index,value){
        $(this).attr("style","display:none");
    });
  }
  
  //Cache les icones
  function hidePrivateIcons(){
    //logDebug("Hide private");
    $(".button--private").each(function(index,value){
        $(this).attr("style","");
    });
    
    $(".button--public").each(function(index,value){
        $(this).attr("style","");
    });
    
    //Remettre le login form d'applomb
    $("#mescartes-header").attr("class","hidden");
	$("#mescartes-body").attr("class","hidden");
	$("#login-form").attr("class","");
	$("#login-msg").attr("class","");
	$("#login-msg").html(" ");
	
  }
