var RECEMAIL = "correo@ejemplo.com"; //correos separados por comas, dentro de las comillas.
var CLOSEPER = 0.8; // porcentaje del presupuesto 0.8 ~ 90%
var fullCampList = "";

function main(){
  var accounts = MccApp.accounts().withIds(['000-000-0000']).get(); //IDs de las cuentas a obtener, entre comillas simples, separadas por comas, cuidar los corchetes.
  while (accounts.hasNext()) {
    var thisAccount = accounts.next();
    var accountName = thisAccount.getName();
    MccApp.select(thisAccount);
    fullCampList = checkCampaigns(accountName);
  }
  if(fullCampList.length != 0){
    sendEmail(RECEMAIL, fullCampList, accountName);
  }else{
    Logger.log("No hay campañas cercanas al presupuesto diario.");
  }
}

function checkCampaigns(accountName){
  var campaigns = AdWordsApp.campaigns().withCondition('Status = ENABLED').get();
  var campList = "";
  while (campaigns.hasNext()) {
    var thisCampaign = campaigns.next();
    var stats = thisCampaign.getStatsFor("TODAY");
    var budget = Math.ceil(thisCampaign.getBudget());
    var spend = Math.ceil(stats.getCost());
    var name = thisCampaign.getName();
    if (spend > (budget * CLOSEPER)) {
      campList += "Cuenta " + accountName + ":\n";
      campList += "Campaña: " + name + "\nPresupuesto: " + formatNumber(budget) + "\nGastado: " + formatNumber(spend) + "\n\n";
    }
  }
  var shoppingCampaigns = AdWordsApp.shoppingCampaigns().withCondition('Status = ENABLED').get();
  var shopCampList = "";
  while (shoppingCampaigns.hasNext()) {
    var thisCampaign2 = shoppingCampaigns.next();
    var stats2 = thisCampaign2.getStatsFor("TODAY");
    var budget2 = Math.ceil(thisCampaign2.getBudget());
    var spend2 = Math.ceil(stats2.getCost());
    var name2 = thisCampaign2.getName();
    if (spend2 > (budget2 * CLOSEPER)) {
      shopCampList += "Cuenta " + accountName + ":\n";
      shopCampList += "Campaña de Shopping: " + name2 + "\nPresupuesto: " + formatNumber(budget2) + "\nGastado: " + formatNumber(spend2) + "\n\n";
    }
  }  
  if(campList.length != 0){
    fullCampList += campList + "\n";
  }
  if(shopCampList.length != 0){
    fullCampList += shopCampList + "\n";
  }
  return fullCampList;
}

function sendEmail(email, body, accountName){
  var subject = "Hola, hay cuentas que tienen campañas cercanas al Presupuesto Diario (" + (CLOSEPER * 100) + "%)";
  Logger.log("Email enviado, asunto: " + subject);
  MailApp.sendEmail(email, subject, body);
}

function formatNumber(num){
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}