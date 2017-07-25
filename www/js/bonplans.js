/** Réecriture de la fonciton showBp de Novacard */
function showBp(el, url){
	$(".selected").removeClass("selected");
    $(el).addClass("selected");
    appNav.pushPage("generic-divbp");
    loaderOn();
    setTimeout(function(){
        $("#bonplan-frame").attr("src",url);    
    },500);
}