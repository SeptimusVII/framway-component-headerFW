module.exports = function(app){
    var HeaderFW = Object.getPrototypeOf(app).HeaderFW = new app.Component("headerFW");
    // HeaderFW.debug = true;
    HeaderFW.createdAt      = "2.0.0";
    HeaderFW.lastUpdate     = "2.0.0";
    HeaderFW.version        = "1";
    // HeaderFW.factoryExclude = true;
    // HeaderFW.loadingMsg     = "This message will display in the console when component will be loaded.";
    // HeaderFW.requires       = [];

    // HeaderFW.prototype.onCreate = function(){
    // do thing after element's creation
    // }
    return HeaderFW;
}