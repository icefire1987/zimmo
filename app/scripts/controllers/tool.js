'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:ToolCtrl
 * @description
 * # ToolCtrl
 * Controller of the zimmoApp
 */
angular.module('zimmoApp')
    .controller('ToolCtrl', ['$http', '$state', 'AuthService', 'NgTableParams', '$timeout', 'leafletData', '$scope', function ($http, $state, AuthService, NgTableParams, $timeout, leafletData, $scope) {
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
        vm.myMap = {}
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
            this.timer;
            vm.feedback.type = responsedata.type;
            vm.feedback.text = responsedata.feedbacktext;
            if (responsedata.addData) {
                vm.feedback.addData = responsedata.addData;
            }

            vm.feedbackVisible = true;
            if (vm.feedback.type == "success") {
                this.timer = $timeout(function () {
                    vm.feedbackVisible = false;
                }, 4000);
            } else {
                $timeout.cancel(this.timer);
            }

        }
        this.exposeSearch = function (searchdata) {
            var credentials = {
                action: 'exposeSearchAll',
                formdata: false
            };
            if (searchdata === true) {
                credentials = {
                    action: 'exposeSearchOne',
                    formdata: vm.searchObj.formdata
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
                    vm.resultAll_tableParams = new NgTableParams({}, {dataset: resultset});
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
                    console.log(response);
                    AuthService.userObj = undefined;
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
                            console.log("err");
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

        }
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
                        console.log(response.data);
                        if (response.data.type === "success" || response.data.type === "err") {
                            vm.showFeedback(response.data);
                            for (var key in response.data.text) {
                                //prevent null and int
                                response.data.text[key] = (response.data.text[key] || "").toString()
                            }
                            vm.currentExpose = response.data.text;
                            // input: number
                            vm.currentExpose.kaufpreis = parseInt(vm.currentExpose.kaufpreis);
                            vm.currentExpose.wohngeld = parseInt(vm.currentExpose.wohngeld);
                            vm.currentExpose.kaltmiete = parseInt(vm.currentExpose.kaltmiete);
                            vm.currentExpose.nebenkosten = parseInt(vm.currentExpose.nebenkosten);
                            vm.currentExpose.pauschalmiete = parseInt(vm.currentExpose.pauschalmiete);

                            try {
                                var dummy = JSON.parse(response.data.text.map);

                                vm.mapdata.center = {
                                    lat: (dummy.lat) * 1,
                                    lng: (dummy.lon) * 1,
                                    zoom: parseInt(dummy.zoom),
                                };
                                vm.mapdata.markers = {
                                    objekt: {
                                        lat: (dummy.lat) * 1,
                                        lng: (dummy.lon) * 1,
                                        focus: true,
                                        draggable: true
                                    }
                                };
                                leafletData.getMap().then(function (map) {
                                    $timeout(function () {
                                        map.invalidateSize();
                                    }, 300);
                                });
                            }catch(e){
                                console.log(e);
                            }

                        }
                    },
                    function (data) {
                        console.log("err");
                    }
                );
        };
        this.deleteProp = function (key) {
            delete vm.currentExpose[key];
        };
        this.setProp = function (key, value) {
            vm.currentExpose[key] = value;
        };

        this.checkExposeForm = function (event) {
            console.log('check');
        };
        this.getMap = function () {
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
            }]
            try {
                if (typeof resdata[0].lon != 'undefined') {
                    var lon_parse = resdata[0].lon;
                    var lat_parse = resdata[0].lat;

                    vm.mapdata.center = {
                        lat: (lat_parse) * 1,
                        lng: (lon_parse) * 1,
                        zoom: parseInt(14),
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

        }
    }])
    .run(
        function () {
            console.log('run tool.js');
            $(".money").on(
                "keyup",
                function (e) {
                    console.log('dough');
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
                        /(\d+)(\d{2})/, '$1' + ','
                        + '$2');

                    $(this).val(form_string)
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

            ngModelCtrl.$parsers.push(function(val) {
                if (angular.isUndefined(val)) {
                    var val = '';
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
                    /(\d+)(\d{2})/, '$1' + ','
                    + '$2');

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
});
;
