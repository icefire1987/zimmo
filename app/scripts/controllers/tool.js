'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:ToolCtrl
 * @description
 * # ToolCtrl
 * Controller of the zimmoApp
 */
angular.module('zimmoApp')
    .controller('ToolCtrl',['$http','$state','AuthService','NgTableParams','$timeout','leafletData','$scope',  function ($http,$state,AuthService,NgTableParams,$timeout,leafletData,$scope) {
        // on local:
        var scriptbase = 'http://localhost/Zimmo/app/';
        // on webserver:
        //var scriptbase = '';
        var vm = this;
            vm.currentExpose = {};
            vm.feedback = {};
            vm.feedbackVisible = false;

        vm.accExpo = {
            statusAddress: {}
        };
           this.doopen = function(){
            if(vm.accExpo.statusAddress.open){
                leafletData.getMap().then(function(map) {
                    $timeout(function() {
                        map.invalidateSize();
                    }, 300);
                });
            }
        };

        vm.accExpo.statusAddress.open = true;
        vm.myMap = {}
        vm.mapdata = {
            center:{},
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
                            id : 'cjurthe.l2na9mmk',
                            token : 'pk.eyJ1IjoiY2p1cnRoZSIsImEiOiI2TkdjdHRnIn0.71Z_P1SMpRUQNdd6NxUFHQ'
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

        this.showFeedback = function(responsedata){

            vm.feedback.type = responsedata.type;
            vm.feedback.text = responsedata.feedbacktext;
            vm.feedbackVisible = true;
            $timeout(function () {
                vm.feedbackVisible = false;
            }, 4000);
        }
        this.exposeSearch = function (searchdata) {
            var credentials = {
                action: 'exposeSearchAll',
                formdata: false
            };
            if(searchdata===true){
                credentials = {
                    action: 'exposeSearchOne',
                    formdata: vm.searchObj.formdata
                };
            }
           
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(function(response) {
                console.log(response);
                if(response.data.type==="success" || response.data.type==="err"){
                    vm.showFeedback(response.data);
                }
                var resultset = JSON.parse(response.data.text);
                vm.cols = [
                    {field: "id", title: "ID", sortable: "id", show: true},
                    {field: "go", title: "Nummer", sortable: "go", show: true},
                    {field: "strasse", title: "Strasse", sortable: "strasse", show: true},
                    {field: "plz", title: "PLZ", sortable: "plz", show: true},
                    {field: "ort", title: "Ort", sortable: "ort", show: true},
                    {field: "ga", title: "Geschäftsart", sortable: "ga", show: true},
                    {field: "oa", title: "Objektart", sortable: "oa", show: true},
                    {field: "action", title: "", dataType: "command", show: true}
                ];
                vm.resultAll_tableParams = new NgTableParams({}, { dataset: resultset});
            })
            ;
        };

        this.logout = function(){
            var credentials = {
                action: 'logout'
            };
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(function(response) {
                console.log(response);
                AuthService.userObj = undefined;
                $state.go("exit");
            })
            ;
        };
        this.del = function(obj){
            var credentials = {
                action: 'exposeDelete',
                formdata: obj
            };
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(
                function(response) {
                    console.log(response.data);
                    if(response.data.type==="success" || response.data.type==="err"){
                        vm.showFeedback(response.data);
                        for(var x=0; x<vm.resultAll_tableParams.data.length;x++){
                            if(vm.resultAll_tableParams.data[x].id==obj.id){
                                vm.resultAll_tableParams.data.splice(x,1);
                            }

                        }

                    }
                },
                function(data){
                    console.log("err");
                }
            );
        };
        this.pdf = function(obj){
            var credentials = {
                action: 'createPDF',
                formdata: obj
            };
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(
                function(response) {
                    console.log(response.data);
                    if(response.data.type==="success" || response.data.type==="err"){
                        vm.feedback = response.data;
                    }
                },
                function(data){
                    console.log("err");
                }
            );

        }
        this.setRecord = function(id){
            var credentials = {
                action: 'echoRecord',
                formdata: {id: id}
            };
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(
                function(response) {
                    console.log(response.data);
                    if(response.data.type==="success" || response.data.type==="err"){
                        vm.showFeedback(response.data);
                        for(var key in response.data.text){
                            //prevent null and int
                            response.data.text[key]=(response.data.text[key] || "").toString()                            
                        }
                        vm.currentExpose = response.data.text;
                        var dummy = JSON.parse(response.data.text.map);
                        vm.mapdata.center = {
                            lat: (dummy.lat)*1,
                            lng: (dummy.lon)*1,
                            zoom: parseInt(dummy.zoom),
                        }
                        leafletData.getMap().then(function(map) {
                            $timeout(function() {
                                map.invalidateSize();
                            }, 300);
                        });
                    }
                },
                function(data){
                    console.log("err");
                }
            );
        };
        this.deleteProp = function(key){
            delete vm.currentExpose[key];
        };
        this.setProp = function(key,value){
            vm.currentExpose[key] = value;
        };

        this.checkExposeForm = function(event){
            console.log('check');
        };
        this.getMap = function() {
            try {
                if (vm.myMap != undefined) {
                    vm.myMap.remove();
                }
            } catch (e) {

            }
            /*
            $http({
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
                }
            );
            */
            var resdata = [{"place_id":"33098231","licence":"Data © OpenStreetMap contributors, ODbL 1.0. http:\/\/www.openstreetmap.org\/copyright","osm_type":"node","osm_id":"2820059681","boundingbox":["52.4526087","52.4527087","13.5268979","13.5269979"],"lat":"52.4526587","lon":"13.5269479","display_name":"90D, Schnellerstraße, Niederschöneweide, Treptow-Köpenick, Berlin, 12439, Deutschland","class":"place","type":"house","importance":0.321}]
            try {
                if (typeof resdata[0].lon != 'undefined') {
                    var lon_parse = resdata[0].lon;
                    var lat_parse = resdata[0].lat;

                    vm.mapdata.center = {
                        lat: (lat_parse)*1,
                        lng: (lon_parse)*1,
                        zoom: parseInt(14),
                    };
                    vm.mapdata.makers = {
                        osloMarker: {
                            lat: (lat_parse)*1,
                            lon: (lon_parse)*1,
                            message: "Objekt",
                            focus: true,
                            draggable: true
                        }
                    };
                    leafletData.getMap().then(function(map) {
                        $timeout(function() {
                            map.invalidateSize();
                        }, 300);
                    });

                   

                }else{
                    console.log("no");
                }
            } catch (e) {
                console.log("try: get map # "+ e);
            }
        };
    }])
    .run(
        function () {
            console.log('run tool.js');
        }
    )
;
