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
    .controller('ToolCtrl', ['$http', '$state', 'AuthService', 'NgTableParams', '$timeout', 'leafletData', '$scope','$localStorage','FileUploader', function ($http, $state, AuthService, NgTableParams, $timeout, leafletData, $scope,$localStorage, FileUploader) {
        // on local:
        var scriptbase = 'http://localhost/Zimmo/app/';
        // on webserver:
        //var scriptbase = '';
        var vm = this;

        this.repLB = function(){
            return JSON.stringify(vm.currentExpose,null," ").replace(/,/g,', <br>');
        };

        vm.userObj = $localStorage.user;
        vm.userObj.password = {};

        vm.currentExpose = {};

        vm.feedback = {};
        vm.feedbackVisible = false;

        vm.accExpo = {
            statusAddress: {}
        };
        vm.tempdata = {
            cImage:{},
            cGrundriss:{},
            cEnergieausweis:{}
        };
        vm.images = {object:[],grundriss:[],energieausweis:[]};


        this.doopen = function () {
            if (vm.accExpo.statusAddress.open) {
                leafletData.getMap().then(function (map) {
                    $timeout(function () {
                        map.invalidateSize();
                    }, 300);
                });
            }
        };

        vm.accExpo.statusAddress.open = true;
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

        this.searchObj = {
            formdata: {
                nummer: '',
                strasse: '',
                id: ''
            }
        };

        this.showFeedback = function (responsedata) {
            this.timer=null;
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

        this.logout = function () {
            var credentials = {
                action: 'logout'
            };
            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
                .then(function (response) {
                    AuthService.userObj = {};
                    $localStorage.$reset();
                    $state.go("exit");
                })
            ;
        };
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
                            vm.currentExpose.kuechenausstattung = JSON.parse(vm.currentExpose.kuechenausstattung);
                            // checkboxes:
                            vm.currentExpose.kueche = !!+vm.currentExpose.kueche;
                            vm.currentExpose.moebliert = !!+vm.currentExpose.moebliert;
                            vm.currentExpose.saniert = !!+vm.currentExpose.saniert;
                            vm.currentExpose.renoviert = !!+vm.currentExpose.renoviert;
                            vm.currentExpose.denkmalschutz = !!+vm.currentExpose.denkmalschutz;
                            vm.currentExpose.badezimmer = JSON.parse(vm.currentExpose.badezimmer);

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
        this.deleteProp = function (key) {
            delete vm.currentExpose[key];
        };
        this.setProp = function (key, value) {
            vm.currentExpose[key] = value;
        };

        this.checkExposeForm = function () {
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

             /*$http({
                 url: "http://nominatim.openstreetmap.org/search?street="
                 + vm.currentExpose.hausnummer
                 + " "
                 + vm.currentExpose.strasse
                 + "&city="
                 + vm.currentExpose.ort
                 + "&country=de"
                 + "&postalcode="
                 + vm.currentExpose.plz
                 + "&format=json&limit=1&addressdetails=0",
                 method: 'GET'
                 })
                 .then(
                 function (response) {
                    console.log(response);
                     var resdata = response;
                 }
             );*/

            var resdata = [{
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
            }];
            try {
                if (typeof resdata[0].lon != 'undefined') {
                    var lon_parse = resdata[0].lon;
                    var lat_parse = resdata[0].lat;
                    console.log("try if");
                    vm.mapdata.center = {
                        lat: (lat_parse) * 1,
                        lng: (lon_parse) * 1,
                        zoom: parseInt(14)
                    };
                    vm.mapdata.markers = {
                        objekt: {
                            lat: (lat_parse) * 1,
                            lng: (lon_parse) * 1,
                            focus: true,
                            draggable: true
                        }
                    };
                    leafletData.getMap().then(function (map) {
                        $timeout(function () {
                            map.invalidateSize();
                        }, 300);
                    });


                } else {
                    console.log("no");
                }
            } catch (e) {
                console.log("try: get map # " + e);
            }
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
        for (i= -1; i <= 10; i++) {
            list_geschoss.push(i);
        }
        var list_geschoss_zusatz = [];
        angular.copy(list_geschoss,list_geschoss_zusatz);
        list_geschoss_zusatz.push("Dachgeschoss");
        this.datalists = {
            land:["Deutschland","Schweiz","Österreich"],
            stellplatztyp: ["Tiefgaragenstellplatz","Außenstellplatz","Carport","E-Parkplatz","Garage","Parkhaus"],
            wohnungstyp: ["Dachgeschoss","Maisonette","Penthaus"],
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
            lagebeschreibung : [
                {"bezirk":"Lichtenberg","beschreibung":"Der heutige Ortsteil geht zurück auf das im 13. Jahrhundert im Barnim gegründete Dorf Lichtenberg. Dieses Dorf blieb über viele Jahrhunderte eine kleine, landwirtschaftlich geprägte Siedlung mit wenigen hundert Einwohnern im Osten der Stadt Berlin. Erst Ende des 19. Jahrhunderts stieg durch die Industrialisierung die Einwohnerzahl Lichtenbergs um ein Vielfaches, sodass der Ortschaft 1907 das Stadtrecht verliehen wurde. Durch die Gründung von Groß-Berlin im Jahr 1920 wurde die Stadt Lichtenberg jedoch nach Berlin eingemeindet und bildet seitdem den namensgebenden Ortsteil für den Berliner Bezirk Lichtenberg."}
            ],
            badezimmer: [
                "Vollbad","Duschbad","Gäste-WC"
            ]
        };

        this.clickElement = function(id){
            angular.element(id).click();

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

        this.uploader =  new FileUploader({
            url: 'upload.php'
        });

        this.uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
        };

        this.submit_form_expose = function(){
            // vm.currentExpose
            var obj = vm.checkExposeForm();

            if(obj!=false){
                var credentials = {
                    action: "exposeInsert",
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
                        console.log(response);
                        if (response.data.type === "success" || response.data.type === "err") {
                            $state.go("tool.sucheOne", {exposeid: response.data.returnID});
                            vm.showFeedback(response.data);
                        }
                    },
                    function (data) {
                        console.log("err" + data.toString());
                    }
                );

            }else{
                console.log("Check failed");
            }

        };
        this.userEdit = function(){
            var credentials = {
                action: "userEdit",
                formdata: vm.userObj
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

                        }
                    },
                    function (data) {
                        console.log("err" + data.toString());
                    }
                );
        }
        this.userChangePW = function(){
            var credentials = {
                action: "userChangePW",
                formdata: vm.userObj.password
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
                            vm.userObj.password = {}
                            vm.showFeedback(response.data);

                        }
                    },
                    function (data) {
                        console.log("err" + data.toString());
                    }
                );
        }

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
    }]);


