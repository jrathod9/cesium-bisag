/*
    File structure for geoserver:
    workspace baseRasters: includes all baseImagery GeoTiff Files
    workspace contours: includes contours for respective bacImagery
    and so on for other types of reliefs
*/

'use strict';
class Node
{
    constructor(data)
    {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

// Node.prototype.isLess = function(node2) {
//     // console.log('in isLess');
//     if(this.data.interval_length < node2.data.interval_length)    {
//         return true;
//     }
//     else {
//         if(this.data.min_x < node2.data.min_x)    {
//             return true;
//         }
//         else if(this.data.min_x === node2.data.min_x) {
//             if(this.data.min_y < node2.data.min_y)
//                 return true;
//             else {
//                 return false;
//             }
//         }
//         else {
//             return false;
//         }
//     }
// }
//
// Node.prototype.isGreater = function(node2) {
//     if(this.data.interval_length > node2.data.interval_length)  {
//         return true;
//     }
//     else {
//         if(this.data.min_x > node2.data.min_x)    {
//             return true;
//         }
//         else if(this.data.min_x === node2.data.min_x) {
//             if(this.data.min_y > node2.data.min_y)
//                 return true;
//             else
//                 return false;
//         }
//         else {
//             return false;
//         }
//     }
// }

Node.prototype.isLess = function(node2)    {
    if(this.data < node2.data)  {
        return true;
    }
    else {
        return false;
    }
}

Node.prototype.isGreater = function(node2) {
    if(this.data > node2.data)  {
        return true;
    }
    else {
        return false;
    }
}

class BST
{
    constructor()
    {
        this.root = null;
    }
}

BST.prototype.insert = function(data) {
    let newNode = new Node(data);
    if(this.root === null)
        this.root = newNode;
    else
        this.insertNode(this.root, newNode);
}

BST.prototype.insertNode = function(node, newNode) {
    if(newNode.isLess(node))
    {
        if(node.left === null)
            node.left = newNode;
        else
            this.insertNode(node.left, newNode);
    }
    else
    {
        if(node.right === null)
            node.right = newNode;
        else
            this.insertNode(node.right,newNode);
    }
}

BST.prototype.findMinNode = function(node)
{
    if(node.left === null)
        return node;
    else
        return this.findMinNode(node.left);
}

BST.prototype.remove = function(data)
{
    let key = new Node(data);
    this.root = this.removeNode(this.root, data);
}

BST.prototype.removeNode = function(node, key)
{
    if(node === null)
        return null;
    else if(key.isLess(node))
    {
        node.left = this.removeNode(node.left, key);
        return node;
    }
    else if(key.isGreater(node))
    {
        node.right = this.removeNode(node.right, key);
        return node;
    }
    else
    {
        if(node.left === null && node.right === null)
        {
            node = null;
            return node;
        }
        if(node.left === null)
        {
            node = node.right;
            return node;
        }
        else if(node.right === null)
        {
            node = node.left;
            return node;
        }
        let aux = this.findMinNode(node.right);
        node.data = aux.data;

        node.right = this.removeNode(node.right, aux.data);
        return node;
    }

}

BST.prototype.searchNode = function(node, key)  {
    if(node === null)
        return null;
    else if(key.isLess(node))   {
        return this.searchNode(node.left, key);
    }
    else if(key.isGreater(node))    {
        return this.searchNode(node.right, key);
    }
    else {
        return node;
    }
}

BST.prototype.search = function(data) {
    let key = new Node(data);
    // let searched = this.searchNode(this.root, key);
    let searched;
    if((searched=this.searchNode(this.root,key)) === null) {
        return null;
    }
    else {
        return searched.data;
    }
}

BST.prototype.inorder = function(node)
{
    if(node !== null)
    {
        this.inorder(node.left);
        console.log(node.data);
        this.inorder(node.right);
    }
}

BST.prototype.getRootNode = function()
{
    return this.root;
}

//Permutes the array so that tree is not skewed
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//Gets JSON objects from the SQL query
(function() {
    const Cesium = require('cesium/Cesium');
    require('cesium/Widgets/widgets.css');

    let viewer = new Cesium.Viewer('cesiumContainer', {
        requestRenderMode : true,
        maximumRenderTimeChange : Infinity
    });

    let expressProxyBaseUrl = 'http://localhost:8585/';
    let geoserverBaseUrl = 'http://localhost:8080/';

    let allDatasourcesNames = new BST();
    viewer.imageryLayers.remove(viewer.imageryLayers.get(0));
    let prov = new Cesium.WebMapServiceImageryProvider({
            url : geoserverBaseUrl+'geoserver/Rasters/wms',
            layers: 'Rasters:_22_92 ',
            parameters: {
                service: 'WMS',
                version: '1.1.1',
                request: 'GetMap',
                format: 'image/jpeg',
                tiled: true
            }
    });
    viewer.imageryLayers.addImageryProvider(prov);

    let tp = new Cesium.CesiumTerrainProvider({
        url : 'http://localhost:9000/tilesets/tiles',
        requestVertexNormals : true
    });
    viewer.terrainProvider = tp;


    viewer.camera.changed.addEventListener(function() {
        let scratchRectangle = new Cesium.Rectangle();
        var val = viewer.scene.camera.getPixelSize(Cesium.BoundingSphere.fromEllipsoid(viewer.scene.globe.ellipsoid), viewer.scene.drawingBufferWidth, viewer.scene.drawingBufferHeight);

        let rect = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid, scratchRectangle);
        let bbox = {
            layer : '_my_contours',
            min_x : Cesium.Math.toDegrees(rect.west),
            min_y : Cesium.Math.toDegrees(rect.south),
            max_x : Cesium.Math.toDegrees(rect.east),
            max_y : Cesium.Math.toDegrees(rect.north)
        };

        let xsq = (bbox.max_x - bbox.min_x)*(bbox.max_x - bbox.min_x);
        let ysq = (bbox.max_y - bbox.min_y)*(bbox.max_y - bbox.min_y);
        let distance = Math.sqrt(xsq+ysq)*111;

        //Random Value
        if(distance < 100 && distance > 30)   {
            bbox.interval = 100;
        }
        // else if(distance <= 30) {
        //     bbox.interval = 10;
        // }
        else{
            bbox.interval = 1000;
        }
        // console.log(bbox);
        //Sets intervals depending on the values
        if(bbox.interval < 1000)    {

            let vectorUrl = expressProxyBaseUrl + 'geoserver/tiledcontours?layer=' + bbox.layer + '&min_x=' + bbox.min_x + '&max_x=' + bbox.max_x + '&min_y=' + bbox.min_y + '&max_y=' + bbox.max_y + '&interval=' + bbox.interval;
            fetch(vectorUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept' : 'application/json'
                }
            })
            .then(response => {
                if(response.ok)
                    // console.log(response);
                    return response.json();
            })
            .then(responseJson => {
                // console.log(typeof responseJson);
                console.log(responseJson);
                let geojsonOptions = {
                    clampToGround : true,
                    stroke: Cesium.Color.YELLOW,
                    fill: Cesium.Color.YELLOW
                };
                shuffle(responseJson);
                for(let layerJson of responseJson)  {
                    if(allDatasourcesNames.search(layerJson.tiledname) === null)    {
                        allDatasourcesNames.insert(layerJson.tiledname);
                        let jsonUrlOptions = {
                            workspace: bbox.layer,
                            service: 'WFS',
                            version: '1.0.0',
                            request: 'GetFeature',
                            typeName: '' + bbox.layer + ':' + layerJson.tiledname,
                            outputFormat: 'application/json'
                        };
                        // console.log(jsonUrlOptions);
                        let myJsonUrl = 'http://localhost:8080/geoserver/' + jsonUrlOptions.workspace + '/ows?service=' + jsonUrlOptions.service + '&version=' +jsonUrlOptions.version + '&request=' + jsonUrlOptions.request + '&typeName=' + jsonUrlOptions.typeName + '&outputFormat=' + jsonUrlOptions.outputFormat;

                        let contourPromise = Cesium.GeoJsonDataSource.load(myJsonUrl, geojsonOptions);

                        contourPromise.then((dataSource) => {
                            viewer.dataSources.add(dataSource);
                        })
                        .otherwise((e) =>  {
                            console.log(e);
                        });
                    }
                    else {
                        console.log('search didnt return null for ', layerJson.tiledname);
                    }
                }
            })
            .catch(err => {
                console.log(err);
            })
        }
    });

    // let tileOptions = {
    //     layer: '_my_contours',
    //     min_x: 91,
    //     max_x: 92,
    //     min_y: 21,
    //     max_y: 22,
    //     interval: 100
    // };
    // let vectorUrl = expressProxyBaseUrl + 'geoserver/tiledcontours?layer=' + tileOptions.layer + '&min_x=' + tileOptions.min_x + '&max_x=' + tileOptions.max_x + '&min_y=' + tileOptions.min_y + '&max_y=' + tileOptions.max_y + '&interval=' + tileOptions.interval;
    // fetch(vectorUrl, {
    //     method: 'GET',
    //     mode: 'cors',
    //     headers: {
    //         'Accept' : 'application/json'
    //     }
    // })
    // .then(response => {
    //     if(response.ok)
    //         // console.log(response);
    //         return response.json();
    // })
    // .then(responseJson => {
    //     console.log(typeof responseJson);
    //     console.log(responseJson[0]);
    //
    // })
    // .catch(err => {
    //     console.log(err);
    // })
    // viewer.camera.moveStart.addEventListener(function() {
    //     var val = viewer.scene.camera.getPixelSize(Cesium.BoundingSphere.fromEllipsoid(viewer.scene.globe.ellipsoid), viewer.scene.drawingBufferWidth, viewer.scene.drawingBufferHeight);
    //     console.log(val);
    //     // the camera started to move
    // });



    // toolbar.innerHTML = '<pre>' +
    //     'West: ' + Cesium.Math.toDegrees(rect.west).toFixed(4) + '<br/>' +
    //     'South: ' + Cesium.Math.toDegrees(rect.south).toFixed(4) + '<br/>' +
    //     'East: ' + Cesium.Math.toDegrees(rect.east).toFixed(4) + '<br/>' +
    //     'North: ' + Cesium.Math.toDegrees(rect.north).toFixed(4) + '</pre>';

    //
    // var extent = Cesium.Rectangle.fromDegrees(46.176235, 6.120418, 47.176235, 7.120418);
    // Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    // Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    // Scractch memory allocation, happens only once.



    // let mouseEvent = new Cesium.CameraEventAggregator(viewer.scene.canvas);

    // if(mouseEvent.anyButtonDown)    {
    //     var val = viewer.scene.camera.getPixelSize(Cesium.BoundingSphere.fromEllipsoid(viewer.scene.globe.ellipsoid), viewer.scene.drawingBufferWidth, viewer.scene.drawingBufferHeight);
    //     console.log(val);
    // }
    //

    // let geojsonOptions = {
    //     clampToGround : true,
    //     stroke: Cesium.Color.BLACK,
    //     fill: Cesium.Color.BLACK
    // };
    //
    // console.log(viewer.imageryLayers.get(0));
    // viewer.flyTo(viewer.imageryLayers.get(0));

    // let jsonUrlOptions = {
    //     workspace: 'cite',
    //     service: 'WFS',
    //     version: '1.0.0',
    //     request: 'GetFeature',
    //     typeName: 'cite:_22_93', //layername
    //     outputFormat: 'application/json'
    // };
    //
    // let myJsonUrl = 'http://localhost:8080/geoserver/' + jsonUrlOptions.workspace + '/ows?service=' + jsonUrlOptions.service + '&version=' +jsonUrlOptions.version + '&request=' + jsonUrlOptions.request + '&typeName=' + jsonUrlOptions.typeName + '&outputFormat=' + jsonUrlOptions.outputFormat;
    // let contourPromise = Cesium.GeoJsonDataSource.load(myJsonUrl, geojsonOptions);
    //
    // contourPromise.then((dataSource) => {
    //     viewer.dataSources.add(dataSource);
    // })
    // .otherwise((e) =>  {
    //     let vectorUrl = expressProxyBaseUrl+ 'geoserver/generate/contours?layers=' + jsonUrlOptions.typeName.split(':')[1] + '&workspace=Contours'+ '&format=text&bands=1&interval=100';
    //     console.log(vectorUrl);
    //     fetch(vectorUrl, {
    //         method: 'GET',
    //         mode: 'cors',
    //         headers: {
    //             'Accept' : 'text/plain'
    //         }
    //     })
    //     .then(response => {
    //         if(response.ok) {
    //             return response.text()
    //         }
    //     })
    //     .then(text => {
    //         jsonUrlOptions.workspace = text.split(':')[0];
    //         jsonUrlOptions.typeName = text;
    //         myJsonUrl = 'http://localhost:8080/geoserver/' + jsonUrlOptions.workspace + '/ows?service=' + jsonUrlOptions.service + '&version=' +jsonUrlOptions.version + '&request=' + jsonUrlOptions.request + '&typeName=' + jsonUrlOptions.typeName + '&outputFormat=' + jsonUrlOptions.outputFormat;
    //         return contourPromise = Cesium.GeoJsonDataSource.load(myJsonUrl, geojsonOptions)
    //     })
    //     .then(dataSource => {
    //         viewer.dataSources.add(dataSource);
    //     })
    //     .otherwise(err => {
    //         console.log(err);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //         console.log('sorry');
    //     });
    // });
    //
    // viewer.canvas.addEventListener('click', function(e) {
    //     var mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY);
    //     var ellipsoid = viewer.scene.globe.ellipsoid;
    //     var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid);
    //     if (cartesian) {
    //         var cartographic = ellipsoid.cartesianToCartographic(cartesian);
    //         var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
    //         var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
    //         alert(longitudeString + ', ' + latitudeString);
    //     } else {
    //         alert('Globe was not picked');
    //     }
    // }, false);
    //to facilitate loading of contours dynamically, keep a temp url as base directory, make request to server
    //server returns an array of names for the json files
    //to make it asynchronous, call a recursive function instead of looping
    //do this is got 404 status from geoserver, that is not ok status
    //promises doesnt resolve if data is not loaded
    //now ask the proxy server for the geojson files
    //the proxy server in turn would update database to add the contour files
    //If user wants to set parameters, then use this by default
})();