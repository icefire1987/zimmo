'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:ToolCtrl
 * @description
 * # ToolCtrl
 * Controller of the zimmoApp
 */
angular.module('zimmoApp')
    //NgTableParams
    .controller('ToolCtrl', ['$http', '$state','$rootScope', 'AuthService','UserService', 'NgTableParams', '$timeout', 'leafletData', '$scope','$localStorage','$q','FileUploader', function ($http, $state,$rootScope, AuthService,UserService, NgTableParams, $timeout, leafletData, $scope,$localStorage,$q,FileUploader) {
        // on local:
        var scriptbase = 'http://localhost/Zimmo/app/';
        // on webserver:
        //var scriptbase = '';
        var vm = this;

        this.repLB = function(){
            return JSON.stringify(vm.currentExpose,null," ").replace(/,/g,', <br>');
        };

        this.ajaxCall = function(data){
            //Credentials:

            // action , formdata

            var defer = $q.defer();
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(data.credentials),
                withCredentials: true

            })
                .then(
                    function (response) {
                        if (response.data.type === "success" || response.data.type === "err") {
                            vm.showFeedback(response.data);
                            if(response.data.type=="success"){
                                if(data.callback_success){
                                    data.callback_success(response.data);
                                }
                                defer.resolve(true);
                            }else if(response.data.type=="err"){
                                if(data.callback_err){
                                    data.callback_err(response.data);
                                }
                                defer.resolve(false);
                            }else{
                                if(data.callback_unknown){
                                    data.callback_unknown(response.data);
                                }
                                defer.resolve(false);
                            }
                        }else{
                            if(data.callback_unknown){
                                data.callback_unknown(response);
                            }
                            defer.resolve(false);
                        }
                    },
                    function (data) {
                        console.log("err" + data.toString());
                    }
                );
            return defer.promise;
        };


    // USER
        vm.userObj = {};

        $scope.$watch(UserService.getUser, function (userObj) { ///adding watcher on someService.getChange, it will fire when change changes value
            vm.userObj = userObj; //setting change to controller here you can put some extra logic
        }.bind(this));

        // SET BY INPUT-FIELD
        vm.userObjTemp = {};

        this.userEdit = function(){
            var credentials = {
                action: "userEdit",
                formdata: vm.userObjTemp
            };
            var defer = $q.defer();
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
                .then(
                    function (response) {
                        if (response.data.type === "success" || response.data.type === "err") {
                            vm.showFeedback(response.data);
                            UserService.updateUserObj("prename",vm.userObjTemp.prename);
                            UserService.updateUserObj("lastname",vm.userObjTemp.lastname);
                            defer.resolve(true);
                        }
                    },
                    function (data) {
                        console.log("err" + data.toString());
                        defer.resolve(false);
                    }
                );
            return defer.promise;
        }
        this.userChangePW = function(){
            var credentials = {
                action: "userChangePW",
                formdata: vm.userObj.password
            };
            var defer = $q.defer();
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
                .then(
                    function (response) {
                        if (response.data.type === "success" || response.data.type === "err") {
                            vm.showFeedback(response.data);
                            if(response.data.type=="success"){
                                defer.resolve(true);
                            }else{
                                defer.resolve(false);
                            }
                        }
                    },
                    function (data) {
                        console.log("err" + data.toString());
                    }
                );
            return defer.promise;
        }
        this.checkInvite = function(){

            var credentials = {
                action: "userCheckInvite",
                formdata: {
                    code: null
                }
            };
            var defer = $q.defer();
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true


            })
                .then(
                    function (response) {
                        if (response.data.type === "success" || response.data.type === "err") {
                            UserService.updateUserObj("password",{});
                            if(response.data.type=="success"){
                                vm.invitecode_feeedback = JSON.parse(response.data.txt);
                                defer.resolve(true);
                            }else{
                                vm.showFeedback(response.data);
                            }
                        }else{
                            console.log(response);
                            vm.showFeedback(response.data);
                            defer.resolve(false);
                        }
                    },
                    function (data) {
                        console.log("err");
                        console.log(data);
                    }
                );
            return defer.promise;
        }

        this.userJoinTeam = function(){
            var credentials = {
                action: "userJoinTeam",
                formdata: {
                    teamID: vm.invitecode_feeedback.teamID
                }
            };
            var defer = $q.defer();
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true
            })
                .then(
                    function (response) {
                        if (response.data.type === "success" || response.data.type === "err") {
                            vm.showFeedback(response.data);
                            if(response.data.type=="success"){
                                UserService.updateUserObjTeam("name",vm.invitecode_feeedback.team);
                                vm.invitecode_feeedback = null;
                                defer.resolve(true);
                            }
                        }else{
                            console.log(response);
                            vm.showFeedback(response.data);
                            defer.resolve(false);
                        }
                    },
                    function (data) {
                        console.log("err");
                        console.log(data);
                    }
                );
            return defer.promise;
        }
    // EXPOSE
        vm.currentExpose = {};
        vm.presets = {};
        vm.myMap = {};
        vm.mapdata = {
            center: {},
            defaults: {
                scrollWheelZoom: false
            },
            layers: {
                baselayers: {
                    osm: {
                        name: 'OpenStreetMap',
                        url: 'https://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}',
                        type: 'xyz',
                        layerOptions: {
                            id: 'cjurthe.l2na9mmk',
                            token: 'pk.eyJ1IjoiY2p1cnRoZSIsImEiOiI2TkdjdHRnIn0.71Z_P1SMpRUQNdd6NxUFHQ'
                        }
                    },
                    stam: {
                        name: 'Stamen',
                        url: 'http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
                        type: 'xyz'
                    }
                }
            }
        };

        vm.tempdata = {
            cImage:{},
            cGrundriss:{},
            cEnergieausweis:{}
        };
        vm.images = {object:[],grundriss:[],energieausweis:[]};

        this.del = function (obj) {
            if (window.confirm('Datensatz unwiederruflich löschen?')) {
                var credentials = {
                    action: 'exposeDelete',
                    formdata: obj
                };
                $http({
                    url: scriptbase + 'scripts/php/ajaxCtrl.php',
                    method: 'POST',
                    data: JSON.stringify(credentials),
                    withCredentials: true

                })
                    .then(
                        function (response) {
                            console.log(response.data);
                            if (response.data.type === "success" || response.data.type === "err") {
                                vm.showFeedback(response.data);
                                for (var x = 0; x < vm.resultAll_tableParams.data.length; x++) {
                                    if (vm.resultAll_tableParams.data[x].id == obj.id) {
                                        vm.resultAll_tableParams.data.splice(x, 1);
                                    }

                                }

                            }
                        },
                        function (data) {
                            console.log("err" + data);
                        }
                    );
            }
        };

        this.submit_form_expose = function(){
            // vm.currentExpose

            var obj = vm.checkExposeForm();

            if(obj!=false){
                var credentials = {
                    action: "exposeInsert",
                    formdata: obj
                };
                var defer = $q.defer();
                $http({
                    url: scriptbase + 'scripts/php/ajaxCtrl.php',
                    method: 'POST',
                    data: JSON.stringify(credentials),
                    withCredentials: true

                })
                    .then(
                        function (response) {
                            console.log(response);
                            if (response.data.type === "success" || response.data.type === "err") {
                                defer.resolve(true);
                                if(obj.showLageplan){
                                    vm.saveMapFile(response.data.returnID).then(function(response2){
                                        $state.go("tool.sucheOne", {exposeid: response.data.returnID});
                                        vm.showFeedback(response.data);
                                    });
                                }else{

                                    $state.go("tool.sucheOne", {exposeid: response.data.returnID});
                                    vm.showFeedback(response.data);

                                }

                            }
                        },
                        function (data) {
                            console.log("err" + data.toString());
                            defer.resolve(false);
                        }
                    );

            }else{
                console.log("Check failed");
            }
            return defer.promise;
        };

        this.setRecord = function (id) {
            var credentials = {
                action: 'echoRecord',
                formdata: {id: id}
            };
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
                .then(
                    function (response) {
                        if (response.data.type === "success" || response.data.type === "err") {
                            vm.showFeedback(response.data);
                            for (var key in response.data.text.currentExpose) {
                                //prevent null and int
                                response.data.text.currentExpose[key] = (response.data.text.currentExpose[key] || "").toString();
                            }

                            if(response.data.text.images == null){
                                vm.images = {object:[],grundriss:[],energieausweis:[]};
                            }else{
                                vm.images = response.data.text.images;
                            }

                            vm.currentExpose = response.data.text.currentExpose;
                            // input: number
                            vm.currentExpose.kaufpreis = parseInt(vm.currentExpose.kaufpreis);
                            vm.currentExpose.pauschalmiete = parseFloat(vm.currentExpose.pauschalmiete);
                            vm.currentExpose.decke = parseFloat(vm.currentExpose.decke);
                            vm.currentExpose.wohngeld = parseFloat(vm.currentExpose.wohngeld);
                            vm.currentExpose.kaltmiete = parseFloat(vm.currentExpose.kaltmiete);
                            vm.currentExpose.nebenkosten = parseFloat(vm.currentExpose.nebenkosten);
                            vm.currentExpose.kaution = parseFloat(vm.currentExpose.kaution);
                            vm.currentExpose.stellplatz = parseFloat(vm.currentExpose.stellplatz);
                            vm.currentExpose.stellplatzkosten = parseFloat(vm.currentExpose.stellplatzkosten);

                            vm.currentExpose.innenausstattung = JSON.parse(vm.currentExpose.innenausstattung);
                            vm.currentExpose.boden = JSON.parse(vm.currentExpose.boden);
                            if(vm.currentExpose.kuechenausstattung!=="") {
                                vm.currentExpose.kuechenausstattung = JSON.parse(vm.currentExpose.kuechenausstattung);
                            }
                            if(vm.currentExpose.badezimmer!=="") {
                                vm.currentExpose.badezimmer = JSON.parse(vm.currentExpose.badezimmer);
                            }
                            // checkboxes:
                            vm.currentExpose.kueche = !!+vm.currentExpose.kueche;
                            vm.currentExpose.moebliert = !!+vm.currentExpose.moebliert;
                            vm.currentExpose.bezugsfrei = !!+vm.currentExpose.bezugsfrei;
                            vm.currentExpose.saniert = !!+vm.currentExpose.saniert;
                            vm.currentExpose.renoviert = !!+vm.currentExpose.renoviert;
                            vm.currentExpose.denkmalschutz = !!+vm.currentExpose.denkmalschutz;

                            vm.currentExpose.showLageplan = !!+vm.currentExpose.showLageplan;

                            try {
                                if(response.data.text.map){
                                    var dummy = JSON.parse(response.data.text.map);
                                    console.log("then try center");
                                    vm.mapdata.center = {
                                        lat: (dummy.lat) * 1,
                                        lng: (dummy.lng) * 1,
                                        zoom: parseInt(dummy.zoom)
                                    };
                                    console.log("then try markers");
                                    vm.mapdata.markers = {
                                        objekt: {
                                            lat: (dummy.lat) * 1,
                                            lng: (dummy.lng) * 1,
                                            focus: true,
                                            draggable: true
                                        }
                                    };
                                    leafletData.getMap().then(function (map) {
                                        $timeout(function () {
                                            map.invalidateSize();
                                        }, 300);
                                    });
                                }

                            }catch(e){
                                console.log(e);
                            }

                        }
                    },
                    function (data) {
                        console.log("err" +  data);
                    }
                );
        };
        this.setExposeModelData = function(model,item){
            vm.currentExpose[model]= item;
        }
        this.addImage = function(kat){

            var canvas =  vm.tempdata.cImage.cropper.getCroppedCanvas();

            vm.addToImages({
                arrayname:'object',
                data: {
                    title:angular.copy(vm.tempdata.cImage.title),
                    imgString:canvas.toDataURL(),
                    source:vm.tempdata.cImage.source,
                    kat:{
                        "type": "select",
                        "name": "Service",
                        "value": kat,
                        "values": [ "Titelbild", "Objektbild"]
                    }
                }
            });

            // empty CroppArea
            vm.tempdata.cImage.cropper.destroy();
            vm.tempdata.cImage.source = null;
            vm.tempdata.cImage.title = "";

            var c=document.getElementById("canvas_crop");
            var ctx=c.getContext("2d");
            ctx.clearRect(0,0,c.width,c.height);

        };

        this.addToImages = function(obj){
            /*
             data = {
             title,imgString,source,kat(additional dropdown data)
             }
             */
            console.log("addToImages");
            console.log(obj);
            if(!vm.images[obj.arrayname]){
                vm.images[obj.arrayname] = [];
            }
            vm.images[obj.arrayname].push(obj.data);
        };


        this.addBadezimmer = function (badezimmer) {
            if(!vm.currentExpose.badezimmer){
                vm.currentExpose.badezimmer = [];
            }
            if(vm.currentExpose.badezimmer.length == 0){
                vm.currentExpose.badezimmer = [];
            }
            vm.currentExpose.badezimmer.push({'type':badezimmer,'enSuite':false});
        }
        this.checkExposeForm = function () {
            console.log(vm.currentExpose);
            if(vm.currentExpose.showLageplan){
                vm.currentExpose.lageplan = "lage.png";
            }
            var returnObj = vm.currentExpose;

            returnObj.images = vm.images;
            return returnObj;
        };
        this.getMap = function () {
            try {
                if (vm.myMap != undefined) {
                    vm.myMap.remove();
                }
            } catch (e) {

            }

            /* CrossOrigin-Problem auf localhost */

            $http({
                 url: "https://nominatim.openstreetmap.org/search?street="
                 + vm.currentExpose.hausnummer
                 + "+"
                 + vm.currentExpose.strasse
                 + "&city="
                 + vm.currentExpose.ort
                 + "&country=de"
                 + "&postalcode="
                 + vm.currentExpose.plz
                 + "&format=json&limit=1&addressdetails=0",
                 method: 'GET',
                withCredentials: false
             })
             .then(
                 function (response) {
                     console.log(response);
                     var resdata = response.data;
                     try {
                         if (typeof resdata[0].lon != 'undefined') {
                             var lon_parse = resdata[0].lon;
                             var lat_parse = resdata[0].lat;
                             vm.setMap({lat:lat_parse,lon:lon_parse,zoom: 14});
                         } else {
                             console.log("no");
                         }
                     } catch (e) {
                         console.log("try: get map # " + e);
                     }
                 }
             );

           /* var resdata = [{
                "place_id": "33098231",
                "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http:\/\/www.openstreetmap.org\/copyright",
                "osm_type": "node",
                "osm_id": "2820059681",
                "boundingbox": ["52.4526087", "52.4527087", "13.5268979", "13.5269979"],
                "lat": "52.4526587",
                "lon": "13.5269479",
                "display_name": "90D, Schnellerstraße, Niederschöneweide, Treptow-Köpenick, Berlin, 12439, Deutschland",
                "class": "place",
                "type": "house",
                "importance": 0.321
            }];*/

        };

        this.setMap = function(mapdata){
            vm.mapdata.center = {
                lat: (mapdata.lat) * 1,
                lng: (mapdata.lon) * 1,
                zoom: parseInt(mapdata.zoom)
            };
            vm.mapdata.markers = {
                objekt: {
                    lat: (mapdata.lat) * 1,
                    lng: (mapdata.lon) * 1,
                    focus: true,
                    draggable: true
                }
            };
            vm.currentExpose.map = vm.mapdata.center;
            leafletData.getMap().then(function (map) {
                $timeout(function () {
                    map.invalidateSize();
                }, 300);
            });


        };

        this.saveMapFile = function(objectID){
            var defer = $q.defer();
            leafletData.getMap().then(function (map) {
                $timeout(function () {
                    leafletImage(map, function(err, canvas) {
                        // now you have canvas
                        // example thing to do with that canvas:
                        var obj = {dataurl : canvas.toDataURL(),objectID : objectID};
                        var credentials = {
                            action: 'saveFile',
                            formdata: obj
                        };
                        $http({
                            url: scriptbase + 'scripts/php/ajaxCtrl.php',
                            method: 'POST',
                            data: JSON.stringify(credentials),
                            withCredentials: true

                        })
                            .then(
                                function (response) {
                                    console.log("done");
                                    console.log(response);
                                    defer.resolve(true);
                                },
                                function (data) {
                                    console.log("err");
                                    console.log(data);
                                    defer.resolve(false);
                                }
                            )
                    });
                }, 300);
            });
            return defer.promise;
        };
        this.pdf = function (obj) {
            var credentials = {
                action: 'createPDF',
                formdata: obj
            };
            vm.showFeedback({type: "info", feedbacktext: "Anfrage in Bearbeitung..."});
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
                .then(
                    function (response) {
                        console.log(response.data);
                        if (response.data.type === "success" || response.data.type === "err" || response.data.type === "info") {
                            vm.showFeedback(response.data);
                        } else {
                            console.log(response);
                            vm.showFeedback({type: "err", feedbacktext: "Anfrage fehlgeschlagen. siehe Konsole"});
                        }
                    },
                    function (data) {
                        console.log(data);
                        vm.showFeedback({type: "err", feedbacktext: "Anfrage fehlgeschlagen. siehe Konsole"});
                    }
                );

        };
    // SUCHE
        this.searchObj = {
            formdata: {
                nummer: '',
                strasse: '',
                id: ''
            }
        };

        this.exposeSearch = function (searchOne,searchdata) {
            var credentials = {
                action: 'exposeSearchAll',
                formdata: false
            };
            if (searchOne === true) {
                if(!searchdata){
                    searchdata= vm.searchObj.formdata;
                }
                credentials = {
                    action: 'exposeSearchOne',
                    formdata: searchdata
                };
            }
            vm.showFeedback({type: "info", feedbacktext: "Anfrage in Bearbeitung..."});
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
                .then(function (response) {
                    console.log(response);
                    if (response.data.type === "success" || response.data.type === "err") {
                        vm.showFeedback(response.data);
                    }
                    if (response.data.type === "success") {
                        var resultset = JSON.parse(response.data.text);
                        vm.cols = [
                            {field: "id", title: "ID", sortable: "id", show: true},
                            {field: "go", title: "Nummer", sortable: "go", show: true},
                            {field: "strasse", title: "Strasse", sortable: "strasse", show: true},
                            {field: "plz", title: "PLZ", sortable: "plz", show: true},
                            {field: "ort", title: "Ort", sortable: "ort", show: true},
                            {field: "ga", title: "Geschäftsart", sortable: "ga", show: true},
                            {field: "oa", title: "Objektart", sortable: "oa", show: true},
                            {field: "zimmer", title: "Zimmer", sortable: "zimmer", show: true},
                            {field: "wohnflaeche", title: "Wohnfläche", sortable: "wohnflaeche", show: true},
                            {field: "action", title: "", dataType: "command", show: true}
                        ];
                        vm.resultAll_tableParams = new NgTableParams({}, {dataset: resultset});
                    }
                })
            ;
        };
    // ACC-Tabs
        vm.accExpo = {
            statusAddress: {}
        };

        vm.accExpo.statusAddress.open = true;

        vm.accConfig = {
            statusLage: {open:true}
        };


        this.doopen = function () {
            if (vm.accExpo.statusAddress.open) {
                leafletData.getMap().then(function (map) {
                    $timeout(function () {
                        map.invalidateSize();
                    }, 300);
                });
            }
        };

    // VIEWS
        vm.feedback = {};
        vm.feedbackVisible = false;


        this.showFeedback = function (responsedata) {
            this.timer=null;
            vm.feedback = {};
            vm.feedback.type = responsedata.type;
            vm.feedback.text = responsedata.feedbacktext;
            if (responsedata.addData) {
                vm.feedback.addData = responsedata.addData;
            }

            vm.feedbackVisible = true;
            if (vm.feedback.type === "success") {
                this.timer = $timeout(function () {
                    vm.feedbackVisible = false;
                }, 4000);
            } else {
                $timeout.cancel(this.timer);
            }

        };

        // Config

        vm.configObj = { presets : {}};


        this.getConfig = function(){
            vm.configObj.presets.lage = vm.presets_lage();
        };

        this.presets_lage = function () {
            var credentials = {
                action: "getPresets",
                formdata: {"presetType":"lage"}
            };
            // we only check via php-session
            var defer = $q.defer();
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
                .then(
                    function (response) {
                        console.info(response)
                        if (response.data.type === "success" || response.data.type === "err") {
                            if(response.data.code == 4){
                                //SHOW LOGIN

                            }
                            vm.showFeedback(response.data);

                            defer.resolve(true);
                            try{
                                vm.configObj.lage_db = JSON.parse(response.data.txt);
                            }catch(e){
                                console.error(e);
                            }

                        }
                    },
                    function (data) {
                        console.log("err" + data.toString());
                        defer.resolve(false);
                    }
                );
            return defer.promise;
        };
        this.lage_select = function (){
            vm.configObj.lage_titel = vm.configObj.lage_dropdown.title;
            vm.configObj.lage_text = vm.configObj.lage_dropdown.text;
        }
        this.presets_submitLage = function(obj){
            if(obj.form.$invalid){
                return false;
            }
            var promise = vm.ajaxCall(
                {
                    credentials: {
                        action: "setPresets",
                        formdata: {
                            "presetType": "lage",
                            "action": obj.action,
                            "title":vm.configObj.lage_titel,
                            "text":vm.configObj.lage_text

                        }
                    },
                    callback_success: function (responseObj) {
                        console.info(responseObj);
                        vm.configObj = {};
                        return true;
                    },
                    callback_err: function (responseObj) {
                        console.error(responseObj);
                        return false;
                    },
                    callback_unknown: function (responseObj) {
                        console.error(responseObj);
                        return false;
                    }
                }
            );
            return promise;
        };




        this.logout = function () {
            var promise = vm.ajaxCall(
                {
                    credentials : {
                        action: "logout"
                    },
                    callback_success : function(responseObj){
                        UserService.clear();
                        $localStorage.$reset();
                        $state.go("exit");
                    },
                    callback_err : function(responseObj){
                        console.log(responseObj);
                    },
                    callback_unknown : function(responseObj){
                        console.log(responseObj);
                    }
                }
            );
        };



        this.deleteProp = function (key) {
            delete vm.currentExpose[key];
        };
        this.setProp = function (key, value) {
            vm.currentExpose[key] = value;
        };


        this.clearOtherVal = function(source,targetToClear){
            if(angular.isArray(targetToClear)){
                for(var i=0;i<targetToClear.length;i++){
                    if(vm.currentExpose[source]!=""){
                        vm.currentExpose[targetToClear[i]]="";
                    }
                }
            }else{
                if(vm.currentExpose[source]!=""){
                    vm.currentExpose[targetToClear]="";
                }
            }

        };

        var list_jahre = [];
        for (var i = 1900; i <= new Date().getFullYear(); i++) {
            list_jahre.push(i);
        }
        var list_zimmer = [];
        var half=1;
        for (i= 1; i <= 20; i++) {
            list_zimmer.push(half);
            half+=0.5;
        }

        var list_geschoss = [];
        for (i= 1; i <= 10; i++) {
            list_geschoss.push(i);
        }
        var list_geschoss_zusatz = [];
        angular.copy(list_geschoss,list_geschoss_zusatz);
        list_geschoss_zusatz.push("-1");
        list_geschoss_zusatz.push("Dachgeschoss");

        this.getPresets = function(){
            vm.ajaxCall(
                {
                    credentials : {
                        action: "getPresets"
                    },
                    callback_success: function (responseObj) {
                       for(var type in responseObj){
                           vm.presets[type] = responseObj[type];
                       }
                        return true;
                    },
                    callback_err: function (responseObj) {
                        console.error(responseObj);
                        return false;
                    },
                    callback_unknown: function (responseObj) {
                        console.error(responseObj);
                        return false;
                    }
                }
            );
        };

        this.datalists = {
            land:["Deutschland","Schweiz","Österreich"],
            stellplatztyp: ["Tiefgaragenstellplatz","Außenstellplatz","Carport","E-Parkplatz","Garage","Parkhaus"],
            wohnungstyp: ["Dachgeschoss","Maisonette","Penthouse","Etagenwohnung"],
            haustyp: ["Einfamilienhaus","Bungalow","Doppelhaus","Reihenendhaus","Reihenmittelhaus","Villa","Stadthaus"],
            energieausweis: ["Bedarfsausweis","Verbrauchsausweis"],
            heizung: ["Fernwärme","Gaszentral","Gasetage","Ölzentral","Palletheizung","Erdwärme","Blockheizkraftwerk"],
            kuechenmarke: ["Bulthaup","Nolte","Alno","Nobilia","SieMatic","IKEA"],
            kuechenausstattung:["offene Küche","Wohnküche"],
            innenausstattung: [
                "Hauswirtschaftsraum","Klimaanlage","Aufzug","Wämde gespachtelt","Keller","Doppelkastenfenster","Stuck","Barrierefrei","Kamin","Flügeltüren","Balkon","Terrasse"
            ],
            bodenbelag: [
                "Echtholz-Parkett","hochwertiges Parkett","Fussbodenheizung","Dielen"
            ],
            bildtitel: [
                "Schlafzimmer","Esszimmer","Wohnzimmer","Küche","Ausblick","Flur","Zimmer","Hausansicht","Balkon","Terrasse","Kinderzimmer","Gäste-WC","Badezimmer",
            ],
            jahreszahl: list_jahre,
            zimmer: list_zimmer,
            geschoss: list_geschoss,
            geschoss_zusatz: list_geschoss_zusatz,
            lagebeschreibung : vm.presets.lage,
            badezimmer: [
                "Vollbad","Duschbad","Gäste-WC"
            ]
        };

        this.clickElement = function(id){
            angular.element(id).click();

        };



        this.uploader =  new FileUploader({
            url: 'upload.php'
        });

        this.uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };

        this.checkLogin = function(){

            if(vm.ajaxCall(
                {
                    credentials : {
                        action: "checkLogin"
                    },
                    callback_success : function(responseObj){
                        console.info("S");
                        console.log(responseObj);
                        return true;
                    },
                    callback_err : function(responseObj){
                        console.error("E");
                        console.log(responseObj);
                        return false;
                    },
                    callback_unknown : function(responseObj){
                        console.error("U");
                        console.log(responseObj);
                        return false;
                    }
                }
            )){
                $rootScope.returnToState = $state.current.name;
            }
            // Input speichern und anschließend an Zielfunktion weiterleiten
            //$state.go("getstarted");
        };


    }])
    .run(
        function () {
            $(".money").on(
                "keyup",
                function () {
                    var string = $(this).val();

                    string = string.replace(/,/g, "");
                    string = string.replace(/\./g, "");

                    if (string.length > 3) {
                        string = "" + parseInt(string);
                    }
                    while (string.length < 3) {
                        string = "0" + string;
                    }

                    var form_string = string.replace(
                        /(\d+)(\d{2})/, '$1' + ',' +
                        '$2');

                    $(this).val(form_string);
                });
        }
    )
    .directive('ismoney', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {
                if(!ngModelCtrl) {
                    return;
                }

                ngModelCtrl.$parsers.push(function(data) {
                    var val='';
                    if (angular.isUndefined(data)) {
                        val = '';
                    }else{
                        val = data;
                    }
                    val = val.replace(/,/g, "");
                    val = val.replace(/\./g, "");

                    if (val.length > 3) {
                        val = "" + parseInt(val);
                    }
                    while (val.length < 3) {
                        val = "0" + val;
                    }

                    var form_string = val.replace(
                        /(\d+)(\d{2})/, '$1' + ',' +
                        '$2');

                        ngModelCtrl.$setViewValue(form_string);
                        ngModelCtrl.$render();

                    return form_string;
                });

                element.bind('keypress', function(event) {
                    if(event.keyCode === 32) {
                        event.preventDefault();
                    }
                });
            }
        };
    })



    .directive('repeatCanvas', function() {
        return function(scope, element, attrs) {

            var myCanvas = angular.element(element);
            var ctx = myCanvas[0].getContext("2d");

            var image = new Image();
            image.onload = function() {
                myCanvas[0].width = this.width;
                myCanvas[0].height = this.height;
                ctx.drawImage(image, 0, 0);
            };
            image.src =attrs.data;
        };
    })
    .filter("sanitize", ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        };
    }])

    .directive("fileread", [function () {

        function link( scope, element, attributes,controller ) {
            function handleClick( changeEvent ) {
                scope.$apply(

                    function changeViewModel() {
                        var file = changeEvent.target.files[0];
                        var fr = new FileReader();

                        fr.onload = function () {
                            scope.$apply(function () {


                                if (attributes.modeltarget === 'cImage') {
                                    scope.c_tool.tempdata.cImage.source = true;
                                    var img = new Image();
                                    img.onload = function () {

                                        if (attributes.croparea) {
                                            if (scope.c_tool.tempdata.cImage.cropper) {
                                                scope.c_tool.tempdata.cImage.cropper.destroy();
                                            }

                                            var canvas = document.getElementById(attributes.croparea);
                                            var ctx = canvas.getContext("2d");

                                            var MAX_WIDTH = 1440;
                                            var MAX_HEIGHT = 900;
                                            var width = img.width;
                                            var height = img.height;

                                            if (width > height) {
                                                if (width > MAX_WIDTH) {
                                                    height *= MAX_WIDTH / width;
                                                    width = MAX_WIDTH;
                                                }
                                            } else {
                                                if (height > MAX_HEIGHT) {
                                                    width *= MAX_HEIGHT / height;
                                                    height = MAX_HEIGHT;
                                                }
                                            }
                                            canvas.width = width;
                                            canvas.height = height;

                                            ctx.drawImage(img, 0, 0, width, height);
                                            canvas.toDataURL("image/png");

                                            cropperinit(scope, canvas);
                                        }


                                    };
                                    img.src = fr.result;

                                }
                                if (attributes.modeltarget === 'cGrundriss') {
                                    controller.currentExpose.testdata = "ok";
                                    scope.c_tool.addToImages({
                                        arrayname: 'grundriss',
                                        data: {
                                            title: '',
                                            imgString: fr.result,
                                            source: file,
                                            kat: {
                                                "type": "datalist",
                                                "value": '',
                                                "values": scope.c_tool.datalists.geschoss
                                            }
                                        }
                                    });
                                }
                                if (attributes.modeltarget === 'cEnergieausweis') {

                                    scope.c_tool.addToImages({
                                        arrayname: 'energieausweis',
                                        data: {
                                            title: scope.c_tool.currentExpose.energieausweisTyp,
                                            imgString: fr.result,
                                            source: file
                                        }
                                    });
                                }
                            });
                        };
                        fr.readAsDataURL(file);
                    }
                );
            }
            element.on("change", handleClick);


        }

        function cropperinit(globscope, image){

            globscope.c_tool.tempdata.cImage.cropper = new Cropper(image, {
                modal: true,
                guides: true,
                dragCrop: true,
                movable: true,
                resizable: true,
                zoomable: false,
                touchDragZoom: false,
                mouseWheelZoom: false,
                preview: '#cropper_outputwrapper',
                crop: function(e) {
                    console.log(e.detail.x);
                    console.log(e.detail.y);
                    console.log(e.detail.width);
                    console.log(e.detail.height);

                }
            });
        }

        return ({
            link: link,
            controller: 'ToolCtrl',
            controllerAs: 'vm',
            bindToController: true


        });
    }])
    .directive('buttonSubmit', function() {
        return{
            restrict: 'EA',
            scope: {
                callClick: '&',
                callHtml: "@",
                callClass: "@",
                callIcon: "@"
            },
            controller: function($scope,$element){
                var iconSet = JSON.parse($scope.callIcon);
                $scope.icon = iconSet.init;
                $scope.callClickCallback = function(){
                   var response = $scope.callClick();
                    console.log(response);
                    if(response){
                        response.then(function(result){

                            if(result === true){
                                $scope.icon = iconSet.callback_success;
                            }else{
                                $scope.icon = iconSet.callback_error;
                            }
                        })
                    }else{
                        $scope.icon = iconSet.callback_error;
                    }


               }
            },
            template: '<button type="button" class="{{callClass}}" ng-click="callClickCallback()">' +
                        '<span class="{{icon}}"></span>' +
                        '<span class="marginLeft10">{{callHtml}}</span>' +
                        '</button>',

            link: function(scope, element, attrs){

            }
        };
    })

;


