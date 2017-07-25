/**
 * FONCTIONNALITES DE LOGIN/ACCES <=> OPENCART
 * Repose sur l'API REST de openCart
 * => http://opencartoauth.opencart-api.com/schema_v2.0_oauth
 * => http://sv2109.com/en/article/opencart-api-system (API native)
 * => https://isenselabs.com/posts/using-the-new-api-methods-of-opencart-2x
 * => Voir également le répertoire controller/api de l'installation openCart cible
 * ==> https://github.com/opencart/opencart/tree/master/upload/catalog/controller/api
 * ==> https://forum.opencart.com/viewtopic.php?f=190&t=170990&hilit=api%2Fcustomer%2Flogin
 */

/**
 * Fonction qui permet de redemander le token à OpenCart Pour les accès anonymes =>
 * Alimente la variable globale GLOBAL_authToken
 */
function refreshToken() {
	var destURL = GLOBAL_serverBase + "index.php?route=api/login/";
	var postData = {
		"key" : GLOBAL_apiKey
	};
	if (GLOBAL_authToken.length == 0) {
		$.ajax({
			type : "POST",
			url : destURL,
			async : false,
			data : postData,
			success : function(data) {
				// logDebug(JSON.stringify(data));
				if (typeof data.success !== "undefined") {
					GLOBAL_authToken = data.token;
					GLOBAL_apiId = data.api_id;
				} else {
					alert("Veuillez recharger l'application");
					appNav.pushPage("login");
				}
			},
			dataType : "json"
		});
	} else {
		// Vérifier si le token est à jour
	}
}

/**
 * Fonction qui vérifie si l'appli est toujours connectée
 * 
 * @param reLog
 *            true|false reconnecte si true et que session expirée
 * @return boolean true|false Renvoie vrai si l'utilisateur est connecté
 */
function checkLogin(reLog) {
	var isLogged = false;
	// Dans le cas d'openCart, on fait appel à la route account/login.
	// Si l'utilisateur est connecté => renvoie sur la page compte personnel
	// Sinon => renvoie sur le formulaire de login
	var destURL = GLOBAL_serverBase + "index.php?route=account/login&m=1";
	var opts = {
		url : destURL,
		crossDomain : true,
		context : this,
		async : false,
		xhrFields : {
			withCredentials : true
		},
		dataType : "html",
		type : 'GET',
		success : function(data) {
			var pTitle = $(data).find("h1.heading-title").html();
			if (pTitle === "Consulter mon solde") {
				// logDebug("pTitle :"+pTitle);
				// L'user est connecté
				isLogged = true;
			} else {
				isLogged = false;
			}

		},
		error : function(req, textStatus, errorThrown) {
			appNav.pushPage("unavailable");
			var motif = "";
			if (req.readyState == 4) {
				// HTTP error (can be checked by XMLHttpRequest.status and
				// XMLHttpRequest.statusText)
				motif = "Le service demandé est indisponible <br/>";
				motif += "<b>Erreur:</b> " + textStatus;
			} else if (req.readyState == 0) {
				// Network error (i.e. connection refused, access denied due to
				// CORS, etc.)
				motif = "Une erreur réseau s'est produite <br/>";
				motif += "<b>Erreur:</b> " + req.statusText;
			} else {
				// something weird is happening
				motif = "Oups ! Veuillez relancer l'application <br/>";
				motif += "<b>Erreur:</b>" + textStatus;
			}
			$("#unavailable-motif").html(motif);
			isLogged = false;
		},
	};
	$.ajax(opts);

	if (isLogged) {
		logDebug("Session still active !");
		if (!reLog) {
			// Deconnect user
			var destURL = GLOBAL_serverBase
					+ "index.php?route=account/logout&m=1";
			var opts = {
				url : destURL,
				crossDomain : true,
				async : false,
				xhrFields : {
					withCredentials : true
				},
				dataType : "html",
				type : 'GET',
				success : function(data) {
					logDebug("USER LOGGED OUT");
				},
				error : function(req, textStatus, error) {
					logDebug("ERROR WHEN LOGGING OUT:" + destURL);
					logDebug(error);
					logDebug(req.responseText + " " + req.responseXML);
				},
			};
			$.ajax(opts);
		}
	} else {
		logDebug("Session expired");
		// Relog user with last known credentials
		if (reLog) {

		}
	}

	return isLogged;
}

function loginF(username, password, postFunction) {
	var loginURL = GLOBAL_serverBase + "index.php?route=account/login&m=1";
	var loginArr = {
		"email" : username,
		"password" : password
	};
	var loginData = new FormData();
	$.each(loginArr, function(key, value) {
		loginData.append(key, value);
	});
	// logDebug(loginData);

	var opts = {
		url : loginURL,
		data : loginData,
		// async:false,
		cache : false,
		xhrFields : {
			withCredentials : true
		},
		contentType : false,
		processData : false,
		type : 'POST',
		success : function(data) {
			// Le code réponse est 302 ou 200
			// logDebug(data);
			if (($(data).find("#mobile-content .alert")).length > 0
					&& $(data).find("#mobile-content .login-wrap").length > 0) {
				// La connexion s'est mal passée
				logDebug("LOGIN: Echec de connexion");
				GLOBAL_loginRes.success = false;
				GLOBAL_loginRes.msg = $(data).find("#mobile-content .alert")
						.html();
			} else {
				logDebug("LOGIN: Connexion OK");
				GLOBAL_loginRes.success = true;
				GLOBAL_loginRes.msg = "Authentification réalisée avec succès";
				GLOBAL_userData = {
					username : username,
					password : password
				};
                GLOBAL_isLogged = true;
				// appNav.popPage();
			}
			// loaderOff();
		},
		error : function(req, textStatus, errorThrown) {
			appNav.pushPage("unavailable");
            GLOBAL_isLogged=false;
			var motif = "";
			if (req.readyState == 4) {
				// HTTP error (can be checked by XMLHttpRequest.status and
				// XMLHttpRequest.statusText)
				motif = "Le service demandé est indisponible <br/>";
				motif += "<b>Erreur:</b> " + textStatus;
			} else if (req.readyState == 0) {
				// Network error (i.e. connection refused, access denied due to
				// CORS, etc.)
				motif = "Une erreur réseau s'est produite <br/>";
				motif += "<b>Erreur:</b> " + req.statusText;
			} else {
				// something weird is happening
				motif = "Oups ! Veuillez relancer l'application <br/>";
				motif += "<b>Erreur:</b>" + textStatus;
			}
			$("#unavailable-motif").html(motif);
		},
		// Perform post login actions
		complete : postFunction
	};

	if (loginData.fake) {
		// Make sure no text encoding stuff is done by xhr
		// opts.xhr = function() { var xhr = jQuery.ajaxSettings.xhr();
		// logDebug("LOGIN XHR");
		// xhr.send = xhr.sendAsBinary;
		// logDebug(xhr);
		// return xhr; }
		opts.contentType = "multipart/form-data; boundary="
				+ loginData.boundary;
		opts.data = loginData.toString();
	}
	$.ajax(opts);
}

/**
 * NOT USED Etablir la connexion à OpenCart en utilisant login et mdp Refait une
 * soumission par formulaire pour associer la création de session avec le login
 * et mdp lorsque c'est validé <!> Appel obligé d'être synchrone sur toute la
 * ligne sinon ne fonctionne pas <!> <!> Ne fonctionne sur la plateforme browser
 * qu'avec les headers CORS corrects en Debug<!> (Android / iOS OK)
 */
/*
 * function loginF_API(username, password){ //logDebug("LOGIN"); loaderOn(); var
 * destURL = GLOBAL_serverBase+"index.php?route=api/customer/login"; var
 * postData = {"email": username, "password": password, "token":
 * GLOBAL_authToken, "api_id": GLOBAL_apiId}; $.ajax({ type: "POST", url:
 * destURL, data: postData, async: false, crossDomain: true, //xhrFields: {
 * withCredentials: true }, success: function (data, textStatus, request){
 * if(typeof data.response !== "undefined") { if(data.response.success===true){
 * GLOBAL_loginRes.success=true; GLOBAL_loginRes.msg="Authentification réalisée
 * avec succès"; GLOBAL_userData = data.response.data; var loginURL =
 * GLOBAL_serverBase+"index.php?route=account/login&m=1"; var loginArr =
 * {"email": username, "password": password}; var loginData = new FormData();
 * $.each(loginArr, function(key, value){ loginData.append(key,value); });
 * //logDebug(loginData);
 * 
 * var opts = { url: loginURL, data: loginData, async:false, cache: false,
 * xhrFields: { withCredentials: true }, contentType: false, processData: false,
 * type: 'POST', success: function(data){ appNav.popPage(); loaderOff(); },
 * error: function(error){ logDebug(error); loaderOff(); } }; if(loginData.fake) {
 * 
 * opts.contentType = "multipart/form-data; boundary="+loginData.boundary;
 * opts.data = loginData.toString(); } $.ajax(opts); } else{
 * GLOBAL_loginRes.success=false; GLOBAL_loginRes.msg="Login ou mot de passe
 * incorrect"; loaderOff(); }
 *  } else{ GLOBAL_loginRes.success=false; GLOBAL_loginRes.msg="Login ou mot de
 * passe incorrect"; loaderOff(); } }, error: function(request, textStatus,
 * error){ GLOBAL_loginRes.success=false; GLOBAL_loginRes.msg="Erreur réseau
 * :"+textStatus; //logDebug("FAIL:"+textStatus+"\n R"+request+"\n E"+error);
 * //logDebug(request); loaderOff(); }, dataType:"json" }); }
 */

/**
 * Fonction de chargement des pages. Prend en option un tableau 
 * destination => page choisie 
 * credentials => page nécessitant authentification ou pas 
 * level => niveau de profondeur de navigation 
 * title => titre de la page (sinon, précisé suivant la destination) 
 * silent => chargement silencieux de la page si à vrai
 * timerAjust => si défini, détermine le temps avant la disparition du loader à  la fin de la requête 
 * local => pas de pushpage si à vrai 
 * divId => div à remplacer par le contenu chargé si à vrai 
 * titleId => div à remplacer par le titre choisi si à vrai 
 * animation => type d'animation de transition slide|lift|fade|none (slide par défaut)
 * postData => si setté, fait une requête post vers la page au lieu d'une requête get, avec en paramètre les données passées
 */
function loadPage(options) {
	var title = "Aucun";
	var cLog = false;
	var local = false
	var timerAjust = 500;
	var anim = 'slide';

	if (typeof options["timerAjust"] !== "undefined") {
		timerAjust = options["timerAjust"];
	}

	if (typeof options["animation"] !== "undefined") {
		switch (options["animation"]) {
		case 'slide':
		case 'lift':
		case 'fade':
		case 'none':
			anim = options["animation"];
			break;
		default:
			break;
		}
	}

	if (typeof options["title"] !== "undefined")
		title = options["title"];

	var cLog = false;
	if (typeof options["credentials"] !== "undefined")
		cLog = options["credentials"];

	var destination = "";
	if (typeof options["destination"] !== "undefined")
		destination = options["destination"];
	var level = 1;
	if (typeof options["level"] !== "undefined")
		level = options["level"];

	if (typeof options["force_logout"] !== "undefined")
		// Forcer expiration
		checkLogin(false);

	var divId = "#gen-content-div" + level;
	if (typeof options["divId"] !== "undefined")
		divId = options["divId"];

	var titleId = "#gen-title" + level;
	if (typeof options["titleId"] !== "undefined")
		titleId = options["titleId"];

	if (typeof options["local"] !== "undefined") {
		local = options["local"];
		logDebug("Local call => " + divId);
	}

	logDebug("Destination : "+destination.split("&")[0]);
	
	// Flusher le contenu de session
	if (!cLog && !GLOBAL_isLogged) {
		logDebug("No user connected : force logout applied");
		var destURL = GLOBAL_serverBase + "index.php?route=account/logout&m=1";
		var opts = {
			url : destURL,
			crossDomain : true,
			xhrFields : {
				withCredentials : true
			},
			dataType : "html",
			type : typeR,
			async : false,
			cache : false,
			success : function(data, textStatus, xhr) {
				logDebug("Force logout processed successfully");
			},
			error : function(req, textStatus, errorThrown) {
				logDebug("Error when performing forceLogout");
			}
		};
		$.ajax(opts);
	}
	
	// Si pas encore loggé et page protégée
	if (!GLOBAL_isLogged && cLog) {
		logDebug("Login required for dest:" + destination);
        logDebug("User data : ");
        logDebug(GLOBAL_userData);
        logDebug("cLog :"+cLog);
        //https://onsen.io/v2/docs/angular2/ons-navigator.html#methods-summary
		
		switch (destination.split("&")[0]){
		//Cas où on ne pousse pas en arrière
		case 'consulter':
			//Double sécurité, normalement inutile
			//hidePrivateIcons();	
			break;
		default:
			var pLength = appNav.pages.length;
	        logDebug("Page stack length :"+pLength);
	        if(pLength>1)
	            appNav.popPage();
	        appNav.pushPage('login', {
	    				animation : anim
			});
	        break;
		}
        loaderOff();
        return -1;
	} else {
		var destURL = GLOBAL_serverBase + "index.php?route=";
		$("#gen-title").html("Generic");
		switch (destination.split("&")[0]) {
		case 'login':
		case 'account/login':
			if (!local)
				appNav.pushPage('login', {
					animation : anim
				});
			else {
				logDebug("Local login call:");
				// Cas ou la div appelante contient déjà le formulaire de login
				// logDebug($(divId).html());
				$(divId).children().each(function() {
					if (!$(this).hasClass("hidden"))
						$(this).addClass("hidden");
				})
				$(divId).find("#login-form").removeClass("hidden");
				$(divId).find("#login-msg").html("&nbsp;");

                //Mettre à jour le formulaire de login en cas de changement de compte
                loadLogin('');
			}
			loaderOff();
			return true;
			break;
		case 'forgotten':
		case 'account/forgotten':
			destURL += "account/forgotten&m=1";
			break;
		case 'logout':
		case 'account/logout':
			destURL += "account/logout&m=1";
			break;
		case 'profile':
		case 'account/edit':
			destURL += "account/edit&m=1";
			title = "Mon profil";
			break;
		case 'historique':
			destURL += "account/order&m=1";
			title = "Mes commandes";
			break;
		case 'enseignes':
			destURL += "custompage/liste&m=1";
			title = "Enseignes";
			break;
		case 'offrir':
			destURL += "product/category&path=59&m=1";
			title = "Commander";
			break;
        case 'bonplan':
        case 'account/Cartes/bonsplans':
            destURL += "account/Cartes/bonsplans&m=1";
    		title = "Coupons";
			break;
		case 'cgu':
			destURL += "information/information&information_id=5&m=1";
			title = "C.G.U.";
			break;
		case 'register':
		case 'account/register':
			destURL += "account/register&m=1";
			title = "Créer";
			break;
		case 'showBasket':
		case 'checkout/cart':
			destURL += "checkout/cart&m=1";
			title = "Mon panier";
			break;
		case 'activer':
		case 'account/Cartes/activation':
			if (destination.length > 25)
				destURL += destination + "&m=1";
			else
				destURL += "account/Cartes/activation&m=1";
			title = "Activation";
			break;
		case 'consulter':
		case 'account/Cartes/consultation':
			destURL += "account/Cartes/consultation&m=1";
			title = "Consulter";
			level = 1;
			break;
		case 'recharge':
		case 'account/Cartes/rechargement':
			destURL += "account/Cartes/rechargement&m=1";
			title = "Saisir une recharge";
			level = 1;
			break;
		case 'geolocation':
			destURL += "custompage/liste&m=1";
			title = "Autour";
			break;
		case 'scanBarcode':
			destURL += "custompage/liste&m=1";
			title = "Scanner";
			break;
		// Cas d'une requete custom
		default:
			destURL += (destination + "&m=1");
			// destURL="https://www.google.com";
			break;
		}

		// Si chargement non silencieux
		if (typeof options["silent"] === "undefined" && local === false) {
			logDebug("LoadPage PUSH generic-div" + level);
			appNav.pushPage('generic-div' + level, {
				animation : anim
			});
		}
		logDebug("URL chargée: " + destURL);
		var typeR = 'GET';
		var dataP = null;
		if(typeof options["postData"] != "undefined")
		{	
			typeR ='POST';
			dataP = options["postData"];
			logDebug("POST Request to "+destURL);
			logDebug(dataP);
		}
		
		var opts = {
			url : destURL,
			crossDomain : true,
			xhrFields : {
				withCredentials : true
			},
			dataType : "html",
			type : typeR,
			data : dataP,
			// async:false,
			cache : false,
			success : function(data, textStatus, xhr) {
				if (typeof options["silent"] === "undefined") {
					// logDebug("[NOT SILENT] Destination
					// :"+destination+"=>"+divId);
					var pTitle = $(data).find("h2.secondary-title");
					var loggedOut = false;
					if (pTitle.length > 1) {
						if ($(pTitle[1]).html() == "Identification") {
							// Session expirée, remettre à la page de login
							loggedOut = true;
							// logDebug("LoadPage PUSH LOGIN");
							appNav.pushPage('login');
						}
					}

					if (!loggedOut) {
						$(titleId).html(title);
						// logDebug("Div modifiée :"+$(divId).attr("id")+"
						// "+divId);
						// logDebug($(data).find("div#mobile-content").html());
						$(divId).html($(data).find("div#mobile-content").html());
						if (level > 4)
							level = 1;
						adaptContent(destination, level, divId);
					}
					// logDebug(opts);
				} else {
					// logDebug ("Silent : "+destination);
				}
			},
			error : function(req, textStatus, errorThrown) {
				appNav.pushPage("unavailable");
				var motif = "";
				if (req.readyState == 4) {
					// HTTP error (can be checked by XMLHttpRequest.status and
					// XMLHttpRequest.statusText)
					motif = "Le service demandé est indisponible <br/>";
					motif += "<b>Erreur:</b>" + textStatus;
				} else if (req.readyState == 0) {
					// Network error (i.e. connection refused, access denied due
					// to CORS, etc.)
					motif = "Une erreur réseau s'est produite <br/>";
					motif += "<b>Erreur:</b>" + textStatus;
				} else {
					// something weird is happening
					motif = "Oups ! Veuillez relancer l'application <br/>";
					motif += "<b>Erreur:</b>" + textStatus;
				}
				$("#unavailable-motif").html(motif);
			},
			// Exécuté dans tous les cas après la requête
			complete : function(req, textStatus) {
				switch (destination) {
				case 'logout':
				case 'account/logout':
					logDebug("Logout : load login form");
					setTimeout(function() {
						loadPage({
							destination : 'login',
							credentials : false,
							local : true,
							divId : '#mescartes-content'
						})
					}, 500);
					break;
				case 'consulter':
					$(divId).parent().children().each(function() {
						logDebug("Div " + $(this).attr("id"));
						if (!$(this).hasClass("hidden"))
							$(this).addClass("hidden");
					});

					$(divId).removeClass("hidden");
					// So nasty
					$("#mescartes-header").removeClass("hidden");
					break;
				}
				// Donner du temps à la page de se charger
				// logDebug("LoaderOff Timer: "+timerAjust);
				setTimeout(loaderOff, timerAjust);
			}
		};
		$.ajax(opts);
		// var appBrowser=window.open(destURL,"_self","location=no");
	}

}

/**
 * Fonction utilisée pour adapter le contenu renvoyé par une requête AJAX à
 * OpenCart en contenu qui peut être rendu sur la plateforme.
 */
function adaptContent(destination, level, divId) {
	// logDebug("ADAPT CONTENT "+destination+" "+level);
	// Rewrite img src
	var images = $(divId).find("img");
	// logDebug(images);
	$(images).each(function() {
		$(this).attr("src", GLOBAL_serverBase + $(this).attr("src"));
	});

	// Rewrite links
	var links = $(divId).find("a");
	$(links).each(
			function() {
				var val = $(this).attr("href");
				if (typeof val !== "undefined") {
					var destination = (val.split("route="))[1];
					if (destination.length > 0) {
						destElems = (destination.split("&"))
						destination = destElems[0];
						$.each(destElems, function() {
							var kVals = this.split("=");
							if (kVals.length > 1) {
								if (kVals[0] != "m") {
									destination += "&" + kVals[0] + "="
											+ kVals[1];
								}
							}
						});
					}
					var parent = $(this).parent();
					var content = $(this).html();
					// logDebug(destination);
					if (content == "Retour")
						$(parent).append(
								"<span class=\"link\" onclick=\"appNav.popPage();\">"
										+ content + "</span>");
					else
						$(parent).append(
								"<span class=\"link\" onclick=\"loadPage({credentials: true, destination:'"
										+ destination + "', level:"
										+ ((level + 1) % 4) + "})\">" + content
										+ "</span>");
					$(this).remove();
				}
			});

	// Rewrite forms
	var forms = $(divId).find("form");
	var formNum = 0;
    var formId ="";
	GLOBAL_formData = null;
	$(forms)
			.each(
					function() {
						var submits = $(this).find("input[type=submit]");
						formId = $(this).attr("id");
						if (typeof formId == "undefined") {
							formNum++;
							$(this).attr("id", "form" + formNum);
							formId = "form" + formNum;
						}
						$(this)
								.append(
										"<span id=\"novaform_"+formId+"\" class=\"btn btn-primary button\" onclick=\"loaderOn();submitForm('"
												+ formId
												+ "',"
												+ level
												+ ");\"></span>");

						$(submits).each(
								function() {
									var form = $(this).parent();
									var content = $(this).attr("value");
									var clicAct = $(this).attr("onclick");

									if (typeof clicAct !== "undefined")
										$("#novaform_"+formId).attr("onclick",clicAct + $("#novaform_"+formId).attr("onclick"));
									logDebug("Content <"+content+"> ");
                                    if (content.length == 0)
										content = "Valider";

									$("#novaform_"+formId).text(content);
									$(this).remove();
								});
						// Rajout de la div pour les messages
						$(this).html(
								"<span id=\"novaform-msg\"></span>"
										+ $(this).html());

					});

	// Adaptations du dom suivant la destination choisie (quand c'est
	// nécessaire)
	switch (destination.split("&")[0]) {

	case 'activer':
	case 'account/Cartes/activation':
		// Cacher le reliquat de bouton submit du form et passer par le JS pour
		// faire la soumission
		$("#novaform_formulaire").addClass("hidden");
		$(".form-control").attr("id", "numCarte");
		$("#numCarte").attr("type", "text");
		$("#numCarte").attr("maxlength", "21");
		$("#numCarte").removeClass("form-control");
		// Attacher le listener au champ input

		// Contrôle le masque pour la saisie du numéro de carte (masked input)
		// http://digitalbush.com/projects/masked-input-plugin/
		$("#numCarte").mask("9999 9999 9999 9?999 9");

		break;
	// Recharge
	case 'recharge':
	case 'account/Cartes/rechargement':
		// Retirer l'élément alert en haut
		$($.find(".alert")).remove();
		$($.find("h4")).addClass("recharge-title");

		var cartes = $.find(".product-thumb");

		$(cartes).each(
				function() {

					var modalClass = $($(this).parent()).attr("class").split(
							" ")[0];
					if (typeof modalClass.split("_")[1] !== "undefined") {
						var opts = {
							modalClass : '',
							numCarte : '',
							numReseau : '',
							imgCarte : ''
						};
						opts.modalClass = modalClass;
						opts.numCarte = $(this).find(".card_num").html();
						opts.numReseau = modalClass.split("_")[2];
						opts.imgCarte = $(this).find("img").attr("src");

						logDebug("Numcarte " + opts.numCarte + " "
								+ opts.numReseau);
						$(this).addClass("recharge-carte");

						// Reecriture du numero de carte
						var sC = opts.numCarte.split("");

						opts.numCarte = ""
						for (i = 0; i < sC.length; i++) {
							if (i % 4 == 0)
								opts.numCarte += " ";
							opts.numCarte += sC[i];
						}
						opts.numCarte = opts.numCarte.trim();
						$(this).find(".card_num").html(opts.numCarte);

						$(this).find("a").attr(
								"onclick",
								"showRechargeForm('" + opts.numCarte + "',"
										+ parseInt(opts.numReseau) + ",'"
										+ opts.imgCarte + "');");
					}
				});
		break;
	// Creation de compte
	case 'register':
	case 'account/register':
		// Retirer le message en haut de formulaire
		var alertP = $.find(".account-text");
		$(alertP).html("");
		$(alertP).addClass("hidden");
		break;
	// Card consultation
	case 'consulter':
	case 'account/Cartes/consultation':
		// Retirer l'élément alert en haut
		if (typeof $.find("#nothing") !== "undefined") {
			var elem = $.find("#nothing");
			$(elem)
					.html(
							"<ons-button modifier=\"scanbarcode\" onclick=\"appTab.setActiveTab(1);\">Cliquez pour <br/>ajouter une carte !</ons-button>");
		}
		$($.find(".alert")).remove();
		var cartes = $.find(".image");
		// logDebug(cartes);
		$(cartes)
				.each(
						function() {
							var opts = {
								nomEns : '',
								imgCarte : '',
								numCarte : '',
								statutCarte : '',
								soldePME1 : '',
								soldePME2 : '',
								listTransac : '',
								idEnseigne : ''
							};
							opts.nomEns = $(this).find(".first-image").attr(
									"title").toUpperCase();
							opts.imgCarte = $(this).find(".first-image").attr(
									"src");
							opts.numCarte = $(this).find(".card_num").html();
							opts.statutCarte = "";// $($($(this).find(".card_num").parent()).find("span")[1]).html();
							opts.soldePME1 = $($(this).find(".btn")[0]).html();
							opts.soldePME2 = $($(this).find(".btn")[1]).html();

							// Reecriture du numero de carte
							var sC = opts.numCarte.split("");

							opts.numCarte = ""
							for (i = 0; i < sC.length; i++) {
								if (i % 4 == 0)
									opts.numCarte += " ";
								opts.numCarte += sC[i];
							}
							opts.numCarte = opts.numCarte.trim();
							$(this).find(".card_num").html(opts.numCarte);

							// Active ou pas
							var baseH = $(this).find(".card_num").parent();
							var elem = $(baseH).find("span")[1];
							var cState = $(elem).find("span")[0];
							var isActive = false;
							if ($(cState).html().toLowerCase() === "active") {
								$(cState).attr("class", "cardActive");
								isActive = true;
							} else {
								$(cState).html("Opposée");
								$(cState).attr("class", "cardOpposed");
							}
							$(cState).attr("style", "");

							// Reecriture PME1 et PME2
							$(elem).attr("class", "cardFooter");
							$(elem).attr("style", "");

							// Vérifier qu'ils sont bien définis
							if (typeof opts.soldePME1 !== "undefined")
								$(elem)
										.html(
												$(elem).html()
														+ "<span class=\"cardDetail-pme1\">"
														+ opts.soldePME1
														+ "</span>");
							if (typeof opts.soldePME2 !== "undefined")
								$(elem)
										.html(
												$(elem).html()
														+ "<span class=\"cardDetail-pme2\">"
														+ opts.soldePME2
														+ "</span>");

							if (isActive)
								$(elem)
										.html(
												$(elem).html()
														+ "<span class=\"cardDetail-oppose\" onclick=\"oppoCard('"
														+ opts.numCarte
														+ "')\"><ons-icon icon=\"fa-times\"></ons-icon></span>");

							var links = $(this).find('.cadeau_icon');
							// logDebug(links);
							var link1 = $(links[0]).attr('onclick');
							var link2 = $(links[1]).attr('onclick');

							// logDebug(link2.substring(3, link2.length - 17));
							// Récupérer le modal qui contient la liste des
							// transacs
							if (typeof link2 !== "undefined")
								opts.listTransac = link2.substring(3,
										link2.length - 17);

							// Récupérer le numéro de groupement pour la liste
							// des avantages
							if (typeof link1 !== "undefined")
								opts.idEnseigne = parseInt(link1.split("'")[1]);

							// Transformer le tableau en chaine
							var optString = "{";
							$.each(opts, function(key, value) {
								optString += key + ":'" + value + "',";
							})
							optString = optString.substring(0,
									optString.length - 1);
							optString += "}";
							// logDebug(optString);

							// Nettoyage
							$(this).find(".btn").each(function() {
								$(this).remove();
								// $(this).attr("style","");
							})
							$(this).find('.cadeau_icon').each(function() {
								$(this).remove();
							})

							$(this).find(".first-image").attr("onclick",
									"showCard(" + optString + ");");
						})
		break;
        
        //Edition de l'adresse
        case "account/address/edit":
            break;
        //Cas des bons plans
        case 'bonplan':
        case 'account/Cartes/bonsplans':
            logDebug("Destination :"+ destination.split("&")[0] +" adaptation");
            //Adaptation des images
            var img = $.find(".bonplan img");
            $(img).each(
				function() {
                    var serverPathL = GLOBAL_serverBase.length;
                    $(this).attr("src", $(this).attr("src").substring(serverPathL, $(this).attr("src").length));
				}
            );
            //Retrait de l'iframe
            var iframe = $.find("#bonplan-frame");
            $(iframe).remove();
            
            break;
        default:
            logDebug("Destination :"+ destination.split("&")[0] +" aucune modification du DOM prévue !");
            break;
	}
}

/**
 * Fonction utilisée pour réaliser la soumission des formulaires <!> Attention
 * ne fonctionne pas en mode navigateur <!> A cause des credentials de session :
 * OpenCart attends nécessairement que les données d'un post soient associées à
 * un cookie de session. Or, en mettant withCredentials à false la dite session
 * n'est jamais repassée à OpenCart
 */
function submitForm(formId, level) {
	var form = $.find("form#" + formId);
	if (typeof form !== "undefined") {
		logDebug("Submit form : " + formId)
		var destURL = $(form).attr("action");
		var method = $(form).attr("method");
		var formId = $(form).attr("id");
		var inputs = $(form).find("input");
		var selects = $(form).find("select");
		var fData = new FormData();
        var postTraitDest = destURL.split("?");
        
		$(inputs).each(function() {
			fData.append($(this).attr("name"), $(this).val());
            
		});

        //Collecte au besoin d'infos avant soumission du formulaire
        switch(postTraitDest[1]){
            case "route=account/register&m=1":
                //Cas où c'est un formulaire d'enregistrement
                //1 Récup le login et le mot de passe des données postées
                GLOBAL_credFilecontent = {
                    user:$("#input-email").val(), 
                    pass:$("#input-password").val()
                };
                logDebug("Stockage des infos de log:");
                logDebug(GLOBAL_credFilecontent);
            break;
            default:
                break;
        }

		$(selects).each(
				function() {
					logDebug("Name: " + $(this).attr("name") + " Val:"
							+ $(this).val());
					if ($(this).val() != null)
						fData.append($(this).attr("name"), $(this).val());
					else
						fData.append($(this).attr("name"), 0);
				});

		$("#novaform-msg").html("");
		var opts = {
			url : destURL,
			data : fData,
			// async:false,
			cache : false,
			xhrFields : {
				withCredentials : true
			},
			contentType : "html",
			processData : false,
			type : 'POST',
			success : function(data) {
				// logDebug(data);
				// logDebug("SUCCESS ");
				var resp = $(data).find("#mobile-content");
				if (resp.length > 0) {
					var errors = $(resp).find(".text-danger");
					if (errors.length > 0) {
						// logDebug(errors);
						$("#novaform-msg")
								.html(
										"<b>Veuillez corriger les erreurs ci-dessous:<b/><br/>")
						$.each(errors,
								function() {
									$("#novaform-msg").append(
											$(this).html() + "<br/>");
								});
						$("#novaform-msg").attr("class",
								"text-danger bg-danger");
					} else {
						// logDebug("PAS D'ERREUR MAIS CAS SPACE");
						$("#gen-content-div" + level).html($(resp).html());
					}
				} else {
					// logDebug("ALL GOOD !");
					resp = $(data).find(".text-success");
					if (resp.length > 0){
						$("#gen-content-div" + level).html(
								"<div id=\"novaform-success\" class=\"text-success bg-success\">"
										+ $(resp).html() + "</div>");
                        
                        //Post traitement
                        switch(postTraitDest[1]){
                            case "route=account/register&m=1":
                                //Cas où c'est un formulaire d'enregistrement soumis avec succès
                                //Déclenchement du login
                                logDebug("Création du compte acceptée :");
                                loginF(GLOBAL_credFilecontent.user,GLOBAL_credFilecontent.pass, postLogin);
                                
                                break;
                            default:
                                logDebug("Form post-traitement : "+postTraitDest[1]+" nothing done");
                                break;
                        }
					}else {
                        logDebug("Form post-traitement : "+postTraitDest[1]+" all is loaded");
						// On charge tout
						$("#gen-content-div" + level).html($(data).html());
					}
				}
				loaderOff();
			},
			error : function(error) {
				logDebug("ERROR: " + error.statusText);
				logDebug(error);
				$("#novaform-msg").html(
						"Une erreur s'est produite, veuillez réessayer !")
				$("#novaform-msg").attr("class", "text-danger bg-danger");
				loaderOff();
			}
		};
		if (fData.fake) {
			// Make sure no text encoding stuff is done by xhr
			/*
			 * opts.xhr = function() { var xhr = jQuery.ajaxSettings.xhr();
			 * logDebug("FORM"); xhr.send = xhr.sendAsBinary; logDebug(xhr);
			 * return xhr; }
			 */
			opts.contentType = "multipart/form-data; boundary="
					+ fData.boundary;
			opts.data = fData.toString();
		}
		// logDebug(opts.data);
		$.ajax(opts);
	}
}

/**
 * Fonction qui ajoute la carte dont le numéro est passé en paramètre au compte
 * Revu : 2017.04.11 pour nouveau workflow acquisition 
 * 
 * level1 => Ajout depuis scan
 * level2 => Ajout depuis consultation scan
 */
function addCard(numCarte) {
	logDebug("ADDCARD: Numero de carte: " + numCarte);
	$("#novaform-msg").attr("class", "");
	$("#novaform-msg").html("");
	var destURL = GLOBAL_serverBase
			+ "index.php?route=account/cartes/verification_existence&m=1";
	var opts = {
		url : destURL,
		data : {
			num_carte : numCarte
		},
		xhrFields : {
			withCredentials : true
		},
		type : 'POST',
		dataType : 'json',
		//Révision suite nouveau modèle enrolement
		complete : function(data2) {
			var data = JSON.parse(data2.responseText);
			//logDebug(data);
			if (data.success) // le traitement s'est bien passé
			{
				// le gars est connecté, il n'a pas de code à saisir
				if (data.estConnecte && data.code.length == 0) {
					logDebug("[ACTIVATION] Connecté et pas de code à saisir ");
					//window.location.replace("index.php?route=account/Cartes/activation&actok="+ numCarte+"&m=1");
					loadPage({destination:'account/Cartes/activation&actok='+ numCarte+'&m=1', credentials:true, local:true, divId:'#gen-content-div1'});
					loaderOff();
				}// le gars est connecté mais il a un code a saisir
				else if (data.estConnecte && data.code.length != 0) {
					logDebug("[ACTIVATION] Connecté et code à saisir ");
					if(data.message_error!=null && data.message_error.length>0){
						//Erreur à afficher
						$("#novaform-msg").attr("class","text-danger bg-danger");
						$("#novaform-msg").html(data.message_error);
					}else{
						//L'envoyer vers une page d'activation
						//Champ input name="code" type="text"
						var msg =""
						//route=account/Cartes/activation_ok
						/**
						 * Codes de retour
						 * 1 : email 
						 * 2 : teléphone
						 * 3 : date naiss
						 * 99 : code d'activation
						 */
						$("#numCarte").attr("name","code");
						switch(parseInt(data.code[0])){
						case 1:
							msg= "Veuillez saisir votre adresse e-mail";
							$("#numCarte").mask("");
							break;
						case 2:
							msg= "Veuillez saisir votre numéro de téléphone mobile";
							$("#numCarte").attr("type","tel");
							$("#numCarte").mask("9999999999");
							break;
						case 99:
							msg= "Veuillez saisir votre code d'activation";
							$("#numCarte").attr("type","tel");
							$("#numCarte").mask("9999");		
							//Reprendre le cas de soumission classique du formulaire
							//<!>SO NASTY, KOB, AVENTURA<!>
							
							break;
						}
						$("#lblNumCarte").html(msg);
						$("#numCarte").val("");
						$("#submit").attr("onclick","loaderOn();checkActCode('"+numCarte+"');");
					}
					loaderOff();
				}// le gars n'est pas connecté
				else if (!data.estConnecte || data.estConnecte == null) {
					logDebug("[ACTIVATION] Pas connecté ");
					//Charger la page d'ajout de compte
					//logDebug(data.fiche);
					var cliF = {
						"email" : data.fiche.email,
						"civilite" : data.fiche.civilite,
						"firstname" : data.fiche.firstname,
						"lastname" : data.fiche.lastname,
						"dateNaiss" : data.fiche.dateNaiss,
						"telephone" : data.fiche.telephone,
						"address_1" : data.fiche.address_1,
						"address_2" : data.fiche.address_2,
						"postcode" : data.fiche.postcode,
						"city" : data.fiche.city,
						"not_validate" : 1
					};
					//$('#redirection_register').attr("action", data.redirect);
					//$('#redirection_register').submit();
					logDebug("Données carte : ")
					logDebug(cliF);
					
					loadPage({destination:'register', credentials:false, local:true, divId:'#gen-content-div1', postData: cliF});
				}
			} else{ // la carte est inconnue
				logDebug("[ACTIVATION] Carte inconnue ");
				$("#novaform-msg").html(	"<p class='text-danger bg-danger'>Cette carte est inconnue.</p>");
				loaderOff();
			}
		},
		error : function(error) {
			logDebug("ERROR: " + error.statusText);
			logDebug(error);
			loaderOff();
		}
	};
	//
	$.ajax(opts);
}

/**
 * Vérification du code d'activation pour une carte donnée
 * Fonction appellée depuis la page d'activation d'une carte
 */

function checkActCode(numcarte){
	
	var destURL = GLOBAL_serverBase+ "index.php?route=account/cartes/activation_ok&m=1";
    var fData = new FormData();
    fData.append("num_carte",numcarte);
    fData.append("code",$("#numCarte").val());
    var opts = {
    		url : destURL,
    		data : fData,
    		xhrFields : {
    			withCredentials : true
    		},
    		type : 'POST',
    		dataType : 'html',
    		success : function(data2) {
    			var textSuccess = $(data2).find("p.alert-success").html()
    			if(typeof textSuccess != "undefined" && textSuccess.length>0){
    				$("#activation_form").html("<p class=\"alert alert-success\" style=\"text-align:center;margin-top:10%;margin-bottom:20%;\"> " +
    						"Félicitations !<br/> Votre carte  a été liée à votre compte<br/></p>");
    			}
    			else{
    				$("#activation_form").html("<p class=\"text-danger bg-danger\" style=\"text-align:center;margin-top:10%;margin-bottom:20%;\"> " +
					"Une erreur s'est produite, veuillez réessayer<br/></p>");
    			}
    		},
    		error : function(error) {
    			logDebug("ERROR: " + error.statusText);
    			logDebug(error);
    		},
    		complete : function() {
    			loaderOff();
    		}
	}
	if (fData.fake) {
	// Make sure no text encoding stuff is done by xhr
	/*
	 * opts.xhr = function() { var xhr = jQuery.ajaxSettings.xhr();
	 * logDebug("FORM"); xhr.send = xhr.sendAsBinary; logDebug(xhr); return
	 * xhr; }
	 */
	opts.contentType = "multipart/form-data; boundary=" + fData.boundary;
	opts.data = fData.toString();
	}
	
	$.ajax(opts)
}
/**
 * Opposition d'une carte sur la base de son numéro
 */
function oppoCard(numCarte) {
	dialogBox("Attention !", "Souhaitez vous réellement opposer la carte n°"
			+ numCarte, "oppoDialogBox", "Opposer !", oppoCardOK, null,
			argOK = numCarte, null);
}
function oppoCardOK(numCarte) {
	loaderOn();
	logDebug("OPPOCARD: Numero de carte: " + numCarte);
	$("#novaform-msg").attr("class", "");
	$("#novaform-msg").html("");
	var destURL = GLOBAL_serverBase+ "index.php?route=account/cartes/verification_existence&m=1";
	var opts = {
		url : destURL,
		data : {
			num_carte : numCarte
		},
		xhrFields : {
			withCredentials : true
		},
		type : 'POST',
		dataType : 'json',
		success : function(data2) {
			logDebug(data2);
			// Si c'est bon on balance le formulaire
			// $("#novaform").click();
			if (data2.success) {
				// Valider l'opposition
				// $("#novaform-msg").attr("class","text-danger bg-danger");
				// $("#novaform-msg").html("&nbsp;Carte opposée !
				// "+numCarte+"&nbsp;");
				logDebug("Carte valide " + numCarte);
				var destURL = GLOBAL_serverBase
						+ "index.php?route=account/cartes/opposition_ok&m=1";
				data2 = {
					num_carte : numCarte
				};
				var fData = new FormData();
				fData.append("num_carte", numCarte);
				fData.append("code", "");
				var opts2 = {
					url : destURL,
					data : fData,
					// async:false,
					cache : false,
					xhrFields : {
						withCredentials : true
					},
					contentType : "html",
					processData : false,
					type : 'POST',
					success : function(data3) {
						appNav.popPage();
						// Ramener à mes cartes
						appTab.setActiveTab(0);
						var alert = $(data3).find(".alert-danger");
						// logDebug(data3);
						// logDebug(alert);
						if (alert.length > 0) {
							// Cas d'erreur
							alertBox("Une erreur s'est produite ...", $(alert)
									.html(), "oppoAlertBox", "Fermer");
						}
						// Recharger les cartes
						setTimeout(function() {
							loadPage({
								destination : 'consulter',
								credentials : true,
								local : true,
								divId : '#mescartes-body',
								timerAjust : 1500
							})
						}, 500);

					},
					error : function(error) {
						appNav.pushPage("unavailable");
						var motif = "Une erreur réseau s'est produite !<br/>";
						motif += "<b>Erreur:</b>" + error;

						$("#unavailable-motif").html(motif);
						// logDebug("ERROR: "+error.statusText);
						// logDebug(error);
						// alert("ERROR "+error.statusText+"
						// "+error.responseText);
						loaderOff();
					}
				};
				if (fData.fake) {
					// Make sure no text encoding stuff is done by xhr
					/*
					 * opts.xhr = function() { var xhr =
					 * jQuery.ajaxSettings.xhr(); logDebug("FORM"); xhr.send =
					 * xhr.sendAsBinary; logDebug(xhr); return xhr; }
					 */
					opts2.contentType = "multipart/form-data; boundary="+ fData.boundary;
					opts2.data = fData.toString();
				}
				$.ajax(opts2);
			} else {
				// $("#novaform-msg").attr("class","text-danger bg-danger");
				// $("#novaform-msg").html("&nbsp;Carte inconnue
				// "+numCarte+"&nbsp;");
				logDebug("Carte inconnue ! " + numCarte);
				loaderOff();
			}
		},
		error : function(error) {
			logDebug("ERROR: " + error.statusText);
			logDebug(error);
			loaderOff();
		}
	};
	//
	$.ajax(opts);
}

/**
 * Fonction qui met à jour la liste des cartes de l'utilisateur Renseigne une
 * variable global GLOBAL_cardList avec la liste des cartes et le numero réseau
 * correspondant OK : 2017.10.18
 */
function loadCartes() {
	GLOBAL_cardList = [];
	var destURL = GLOBAL_serverBase
			+ "index.php?route=account/Cartes/rechargement&m=1";
	var opts = {
		url : destURL,
		async : false,
		crossDomain : true,
		xhrFields : {
			withCredentials : true
		},
		dataType : "html",
		type : "GET",
		// async:false,
		cache : false,
		success : function(data, textStatus, xhr) {
			var cartes = $(data).find(".product-thumb");
			$(cartes)
					.each(
							function() {
								var modalClass = $($(this).parent()).attr(
										"class").split(" ")[0];
								if (typeof modalClass.split("_")[1] !== "undefined"
										&& typeof modalClass.split("_")[2] !== "undefined") {
									var numCarte = modalClass.split("_")[1];
									var numReseau = modalClass.split("_")[2];
									if (typeof GLOBAL_cardList[numReseau] == "undefined")
										GLOBAL_cardList[numReseau] = [];

									GLOBAL_cardList[numReseau][GLOBAL_cardList[numReseau].length] = numCarte;
								}
							});
			// logDebug(GLOBAL_cardList);
			$.each(GLOBAL_cardList, function(key, value) {
				// logDebug("Reseau: "+key);
				$.each(value, function() {
					if (this.length > 0)
						logDebug("LOAD CARTES : Rez " + key + " Card " + this);
				});
			});
		},
		error : function(req, textStatus, error) {
			logDebug("LoadCardList " + destination + " ERROR URL:" + destURL);
			logDebug(error);
			logDebug(req.responseText + " " + req.responseXML);
		},
		// Exécuté dans tous les cas après la requête
		complete : function(req, textStatus) {
		}
	};
	$.ajax(opts);
}

/**
 * Fonction d'affichage d'une carte de fidélité nomEns = nom enseigne imgCarte =
 * url image carte numCarte = numéro de la carte statutCarte = statut de la
 * carte soldePME1 = solde nb points fidé soldePME2 = solde nb euros fidé
 * listTransac = id du modal contenant les transactions idEnseigne = id de
 * l'enseigne à laquelle appartient la carte dans OpenCart
 */
function showCard(opts) {
	appNav.pushPage('cardDetail');
	// loaderOn();
	setTimeout(function() {
		$("#cardDetail-title").html(opts.nomEns);
		$("#cardDetail-numCarte").html(opts.numCarte);
		$("#cardDetail-image").attr("src", opts.imgCarte);
		if (opts.soldePME1 !== "undefined")
			$("#cardDetail-pme1").html(opts.soldePME1);
		else
			$("#cardDetail-pme1").html("N/A");

		if (opts.soldePME2 !== "undefined")
			$("#cardDetail-pme2").html(opts.soldePME2);
		else
			$("#cardDetail-pme2").html("N/A");

		$("#cardDetail-transacs").html(
				$(opts.listTransac).find("#transac").html());

		// Appel AJAX pour la liste des avantages
		var destURL = GLOBAL_serverBase
				+ "index.php?route=product/manufacturer/info&id_groupement="
				+ opts.idEnseigne + "&m=1";
		var params = {
			url : destURL,
			xhrFields : {
				withCredentials : true
			},
			dataType : "html",
			type : "GET",
			// async:false,
			cache : false,
			success : function(data) {
				var avantage = $(data).find(".fide-ens");
				$("#cardDetail-avantages").html("<br/>");
				$.each(avantage, function() {
					$("#cardDetail-avantages").html(
							$("#cardDetail-avantages").html() + $(this).html()
									+ "<br/><br/>");
				})
				loaderOff();
			},
			error : function(error) {
				$("#cardDetail-avantages").attr("html",
						"Pas d'avantages publiés pour cette enseigne !");
				loaderOff();
			}
		}
		$.ajax(params);
	}, 500);

}

/**
 * REMPLACEMENT FONCTIONS DEDIEES OPEN CART
 */

function show_enseigne(idEnseigne) {
	options = {
		destination : "product/manufacturer/info&id_groupement=" + idEnseigne,
		credentials : false,
		level : 2,
		title : "Detail enseigne"
	};
	loadPage(options);
}

/**
 * Recherche d'enseignes OK
 */
function searchEnseignes(nomEns) {
	if (nomEns.length >= 3) {
		// logDebug("Nom recherché :"+nomEns);
		$(".groupe_name").each(function() {
			var nomE = $(this).html().toLowerCase();
			var mDiv = $(this).parent().parent();
			// logDebug("Does "+nomE+" includes "+nomEns.toLowerCase())
			if (nomE.indexOf(nomEns.toLowerCase()) != -1) {
				$(mDiv).attr("style", "");
			} else {
				$(mDiv).attr("style", "display:none");
			}
		});
	} else {
		$(".groupe_name").each(function() {
			var nomE = $(this).html().toLowerCase();
			var mDiv = $(this).parent().parent();
			$(mDiv).attr("style", "");
		});
	}
}
/**
 * Utilisé dans la partie ajout de carte
 * 
 * level1 => depuis scan
 * level2 => depuis consultation carte
 */
function verif_existence() {
	loaderOn();
	var numCarte = $("#numCarte").val().replace(" ", "");
	logDebug("Ajout carte :".numCarte);
	$("#erreur").html("");
	$("#erreur").attr("style", "display:none;");
	if (numCarte == null)
		numCarte = " ";
	addCard(numCarte);
}

/**
 * Rechargement => Form action
 * index.php?route=account/Cartes/rechargement_ok&m=1
 */
function showRechargeForm(numCarte, numReseau, imgCarte) {

	appNav.pushPage("cardRecharge");

	setTimeout(function() {
		var cCarte = $.find('#cardRech-numCarte');
		$(cCarte).html(numCarte);
		var inputC = $.find("input[name='numCarte']");
		$(inputC).val(numCarte.replace(/ /g, ""));
		var img = $.find("img");
		$(img).attr("src", imgCarte);
	}, 500);

	setTimeout(loaderOff, 500);
}

/**
 * Fonction qui réalise l'envoi du formulaire de recharge
 */
function sendRechargeForm() {

	var destURL = GLOBAL_serverBase
			+ "index.php?route=account/cartes/rechargement_ok&m=1";
	var fData = new FormData();
	var lInput = $.find("#cardRech-form input");
	$.each(lInput, function() {
		fData.append($(this).attr("name"), $(this).val());
	});
	var opts = {
		url : destURL,
		data : fData,
		xhrFields : {
			withCredentials : true
		},
		type : 'POST',
		dataType : 'json',
		success : function(data2) {
			logDebug(data2);
			if (data2.success) {
				$("#cardRech-message").html("Carte rechargée avec succès !");
				$("#cardRech-message").attr("class", "text-success bg-success");
			} else {
				if (typeof data2.msg !== "undefined")
					$("#cardRech-message").html("Attention:" + data2.msg);
				else
					$("#cardRech-message").html(
							"Attention:" + data2.error_description);

				$("#cardRech-message").attr("class", "text-danger bg-danger");
			}
		},
		error : function(error) {
			logDebug("ERROR: " + error.statusText);
			logDebug(error);

		},
		complete : function() {
			loaderOff();
		}
	}
	if (fData.fake) {
		// Make sure no text encoding stuff is done by xhr
		/*
		 * opts.xhr = function() { var xhr = jQuery.ajaxSettings.xhr();
		 * logDebug("FORM"); xhr.send = xhr.sendAsBinary; logDebug(xhr); return
		 * xhr; }
		 */
		opts.contentType = "multipart/form-data; boundary=" + fData.boundary;
		opts.data = fData.toString();
	}

	$.ajax(opts)
}

/**
 * FOnction ouvrePopUp Utilisé pour les mentions légales et autres
 */

function ouvrePopUp(destURL) {
	appNav.pushPage('generic-popup')
	loaderOn();

	var opts = {
		url : destURL,
		xhrFields : {
			withCredentials : true
		},
		type : 'GET',
		dataType : 'html',
		success : function(data2) {
			$("#generic-content-popup").html($(data2).html());
		},
		error : function(error) {
			logDebug("ERROR: " + error.statusText);
			logDebug(error);
			$("#generic-content-popup")
					.html(
							"<h1>Une erreur s'est produite pendant le chargement de la page</h1>");
		},
		complete : function() {
			loaderOff();
		}
	}
	$.ajax(opts);
}

/**
 * CUSTOMER
 */

