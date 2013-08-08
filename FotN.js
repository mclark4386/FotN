//leap and three.js must be included before this

// shim layer with setTimeout fallback via Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.msRequestAnimationFrame    ||
          window.oRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var view, camera, renderer, player, scene, playerVelocity = new THREE.Vector3(0,0,0);
var speed = 100;

window.onload = function(){
	console.log("onload");
	//three init
	WebGLSetup(function(){
		initScene(function(){
			gameloop();
		});
	});
};

//input loop
Leap.loop({},function(frame){
/* 	console.log(frame.hands); */
	if(frame.hands.length == 1){
		var handPosition = frame.hands[0].palmPosition;
		console.log("handPos:"+JSON.stringify(handPosition)+" set x:"+handPosition[0]/256);
		playerVelocity.x = (handPosition[0]/256.0) * speed;
		playerVelocity.y = (handPosition[2]/-256.0) * speed;
	}else if(frame.hands.length >1){
		var lHand, rHand;
		if(frame.hands[0].x >frame.hands[1].x){
			rHand = frame.hands[0].palmPosition;
			lHand = frame.hands[1].palmPosition;
		}else{
			rHand = frame.hands[1].palmPosition;
			lHand = frame.hands[0].palmPosition;
		}
		console.log("left hand pos:"+JSON.stringify(lHand)+" right hand pos:"+JSON.stringify(rHand));
		
		var l = (lHand[2]/-256.0);
		var r = (rHand[2]/256.0);
	}else{
		playerVelocity.x = 0;
		playerVelocity.y = 0;
		playerVelocity.z = 0;
	}
});


var WebGLSetup = function(callback){
console.log("webgl setup");
   view = document.getElementById('gameView');
   view.height = window.innerHeight;
   view.width = window.innerWidth;
	var WIDTH = view.width
		,HEIGHT = view.height;
   
   console.log(WIDTH+"/"+HEIGHT);
   
   var ASPECT = WIDTH/HEIGHT
   	,VIEW_ANGLE = 60
   	,NEAR = 0.1
   	,FAR = 10000;
   

   renderer = new THREE.WebGLRenderer();
   
   camera = new THREE.PerspectiveCamera(
		VIEW_ANGLE
		,ASPECT
		,NEAR
		,FAR);
		
		//setup resize event
		window.onresize = function(){
			view.width = window.innerWidth;
			view.height = window.innerHeight;
			camera.aspect = view.width/view.height;
			renderer.setSize(view.width,view.height);
			camera.updateProjectionMatrix();
		};
		
   scene = new THREE.Scene();
   scene.add(camera);
   camera.position.z = 300;
   camera.position.y = 40;
	camera.rotation.y = 270;
   renderer.setSize(WIDTH, HEIGHT);

   view.appendChild(renderer.domElement);
   
   callback();
};

var initScene = function(callback){
console.log("init scene");
	var radius = 25
		,segs = 16
		,rings = 16;
		
		var pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.x = 10;
		pointLight.position.y = 50;
		pointLight.position.z = 130;
		scene.add(pointLight);
		
		var sphereMaterial = new THREE.MeshPhongMaterial({
			color: 0xeeeeee
			,shininess:100
			,metal: true
		});
		
		player = new THREE.Mesh(
			new THREE.SphereGeometry(
				radius
				,segs
				,rings
			)
			,sphereMaterial
		);
		
		player.scale.y = 1.5;
		
		scene.add(player);
		
		//terrain
/*
		//trying to use TerrainGeometry
		var image = new Image();
		image.src = "https://raw.github.com/BonsaiDen/TerrainGeometry/gh-pages/images/height.png";
		
		var geo = new TerrainGeometry(300,300, image, 1.0)
			,mat = new THREE.MeshPhongMaterial({color:0x00dd33})
			,mesh = new THREE.Mesh(geo, mat);
			
			geo.scale = mesh.scale;
			geo.position = mesh.position;
			scene.add(mesh);
*/

		//backup flat world
		var geo = new THREE.PlaneGeometry(10000,10000,5,5)
			,mat = new THREE.MeshPhongMaterial({color:0x00dd33})
			,mesh = new THREE.Mesh(geo,mat);
			scene.add(mesh);
		
		callback();
};

var lastTime = Date.now();

var update = function(){
/* 	console.log("update"); */
	var currentTime = Date.now();
	var dt = currentTime - lastTime

	if(playerVelocity.x != 0 || playerVelocity.z != 0){
		console.log("dt:"+dt+" playerVelocity:"+JSON.stringify(playerVelocity)+" playerPos:"+JSON.stringify(player.position)+"cameraPos:"+JSON.stringify(camera.position));	
		}
	

	var tmpVel = playerVelocity;

	player.position.add(tmpVel.multiplyScalar(dt/1000));
	
	var tmpZ =player.position.z;
	camera.position.copy(player.position);
	camera.position.y = camera.position.y+40;//-(playerVelocity.y*10);
/* 	camera.position.x = camera.position.x-(playerVelocity.x*10); */
	camera.position.z = tmpZ+300;

	lastTime = currentTime;
};

var gameloop = function(callback){
/* 	console.log("gameloop"); */
	update();
	renderer.render(scene,camera);
  requestAnimFrame(gameloop);
};

