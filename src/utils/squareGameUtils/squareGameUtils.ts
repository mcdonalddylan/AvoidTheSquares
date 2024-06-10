import * as THREE from 'three';
import { Vector3 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { Tween, Easing } from '@tweenjs/tween.js';

export const setupSquareGameLights = ( scene: THREE.Scene ) => {
    let dirLight = new THREE.DirectionalLight('rgb(255,150,80)', 1);
    dirLight.position.set( 500, 300, -500 );
    dirLight.rotateX(50);
    scene.add( dirLight );

    // Directional light helper (temp af)
    const helpDirLight = new THREE.DirectionalLightHelper( dirLight );
    //scene.add( helpDirLight );

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0x232323, 1);
    scene.add( hemiLight );
};

export const squareGameFunctionality = (
    scene: THREE.Scene,
    renderer: any,
    camera: THREE.PerspectiveCamera,
    quality: any,
    isMobileAspectRatio: boolean) => {

      const isHighQuality = quality === 1;

      let levelWin = false;
      let levelLose = false;

      let mouse = {x: 0, y: 0};

      // Window Resizing
      window.addEventListener( 'resize', onWindowResize );
      function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
			};

      // Skybox
      scene.background = new THREE.Color('rgb(18,54,89)');
      // TODO: ADD TEXTURED SKYBOX FOR HIGH QUALITY
      // const r = 'textures/cube/Bridge2/';
      // const urls = [ r + 'posx.jpg', r + 'negx.jpg',
      //             r + 'posy.jpg', r + 'negy.jpg',
      //             r + 'posz.jpg', r + 'negz.jpg' ];
      // const textureCube = new THREE.CubeTextureLoader().load( urls );

      // scene.background = textureCube;

      // Depth of Field and Bloom effect setup
      const composer = new EffectComposer( renderer );
      const basicRenderPass = new RenderPass( scene, camera );
      composer.addPass( basicRenderPass );
      if (quality === 1) {
        const bokehPass = new BokehPass( scene, camera, { focus: 50, aperture: 0.005, maxblur: 0.02 });
        composer.addPass(bokehPass);
        const bloomPass = new UnrealBloomPass( new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.09, 0.09);
        composer.addPass(bloomPass);
      }
      const outputPass = new OutputPass();
      composer.addPass( outputPass );

      // Player sphere creation
      let playerAcceleration = 0;
      const playerGeo = new THREE.SphereGeometry(isMobileAspectRatio ? 4 : 6, isHighQuality ? 16 : 8, isHighQuality ? 36 : 18);
      const playerMat = new THREE.MeshPhongMaterial({
          color: 'rgb(23,195,230)',
          emissive: 'rgb(0,0,0)',
          specular: 'rgb(255,220,0)',
          shininess: 30,
          reflectivity: 1,
          refractionRatio: 0.98
      });
      let playerMesh = new THREE.Mesh( playerGeo, playerMat );
      playerMesh.geometry.computeBoundingSphere();
      playerMesh.position.set(0,0,-50);
      let playerBoundingSphere = new THREE.Sphere(playerMesh.position, isMobileAspectRatio ? 4 : 6);
      scene.add( playerMesh );
      console.log('camera pos z: ', camera.position.z);
      console.log('player pos z', playerMesh.position.z);
      console.log('distance z: ', camera.position.z - playerMesh.position.z);

      const onMouseMove = ( event: MouseEvent ) => {
          event.preventDefault();
          if(!levelLose && !levelWin) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        
            // Make the sphere follow the mouse
            let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
            vector.unproject( camera );
            let dir = vector.sub( camera.position ).normalize();
            let distance = - (camera.position.z + 50) / dir.z;
            let pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
            playerMesh.position.copy(pos);
          }
      };

      const onTouchMove = ( event: TouchEvent ) => {
        event.preventDefault();
        if(!levelLose && !levelWin) {
          mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
          mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
      
          // Make the sphere follow the mouse
          let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
          vector.unproject( camera );
          let dir = vector.sub( camera.position ).normalize();
          let distance = - (camera.position.z + 50) / dir.z;
          let pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
          playerMesh.position.copy(pos);
        }
    };

      // When the mouse moves, call the given function
      if (isMobileAspectRatio) {
        document.addEventListener('touchmove', onTouchMove, false);
      } else {
        document.addEventListener('mousemove', onMouseMove, false);
      }

      // Level setup
      let level = 1;
      const LEVEL_1_TIME = 50;

      const winLoseLevelDiv = document.getElementById('winLoseText');

      // Timer UI setup
      const bigHand = document.getElementById('timerBigLineAni');
      const littleHand = document.getElementById('timerSmallLineAni');
      let clock = new THREE.Clock();
      let speed = 1;
      let delta = 0;
      let time = LEVEL_1_TIME;
      let timeText: string = `Left: ${LEVEL_1_TIME.toString()}`;

      const timerDiv = document.getElementById('timerDiv');
      const instructionsDiv = document.getElementById('instructionsContainer');
      
      // BG Objects setup
      const moonMat = new THREE.MeshPhongMaterial({
        color: 'rgb(175,130,85)',
        emissive: 'rgb(175,130,85)',
        specular: 'rgb(50,50,50)',
        shininess: 0,
        reflectivity: 0,
        refractionRatio: 0
      });
      moonMat.opacity = 0.1;
      const moonGeo = new THREE.SphereGeometry(400, isHighQuality ? 30 : 15, isHighQuality ? 30 : 15);
      const moonMesh = new THREE.Mesh( moonGeo, moonMat );
      moonMesh.position.set(500, 300, -400);
      moonMesh.scale.z = 0.1;
      const hillMat = new THREE.MeshPhongMaterial({
        color: 'rgb(15,59,102)',
        emissive: 'rgb(0,0,0)',
        specular: 'rgb(255,230,50)',
        shininess: 2,
        reflectivity: 0.1,
        refractionRatio: 0.1
      });
      const hillGeo = new THREE.SphereGeometry(175, isHighQuality ? 20 : 10, isHighQuality ? 20 : 10);
      const NUM_OF_TREES = 35;
      const treeMat = new THREE.MeshPhongMaterial({
        color: 'rgb(23,69,115)',
        emissive: 'rgb(0,0,0)',
        specular: 'rgb(200,180,50)',
        shininess: 1,
        reflectivity: 0.1,
        refractionRatio: 0.1
      });
      let treeMeshArray: THREE.Mesh[] = [];
      const treeGeo = new THREE.ConeGeometry(50,150, isHighQuality ? 12 : 6, isHighQuality ? 6 : 3);
      const generateTrees = (): THREE.Mesh[] => {
        for(let i = 0; i < NUM_OF_TREES; i++) {
          const tempTreeMesh = new THREE.Mesh( treeGeo, treeMat );
          tempTreeMesh.position.set(-2000+(i*randomNumberRange(70,140)),-150+(Math.random()*30),-200);
          treeMeshArray.push(tempTreeMesh);
        }
        return treeMeshArray;
      };
      treeMeshArray = generateTrees();
      let hill1Mesh = new THREE.Mesh( hillGeo, hillMat );
      hill1Mesh.position.set(-300,-175,-300);
      hill1Mesh.scale.set(1.2,1.5,0.4);
      let hill2Mesh = new THREE.Mesh( hillGeo, hillMat );
      hill2Mesh.position.set(0,-250,-300);
      hill2Mesh.scale.set(1.2,1.5,0.4);
      let hill3Mesh = new THREE.Mesh( hillGeo, hillMat );
      hill3Mesh.position.set(600,-175,-300);
      hill3Mesh.scale.set(1.2,1.5,0.4);
      let hill4Mesh = new THREE.Mesh( hillGeo, hillMat );
      hill4Mesh.position.set(900,-250,-300);
      hill4Mesh.scale.set(1.2,1.5,0.4);
      

      scene.add( hill1Mesh, hill2Mesh, hill3Mesh, hill4Mesh,
        ...treeMeshArray, moonMesh );

      // Enemy AI Setup
      let enemyDirection = 1;
      let enemySpeed = 0.2;
      const enemyGeo = new THREE.BoxGeometry(9,9,9,1,1,1);
      enemyGeo.computeBoundingBox();
      const enemyMat = new THREE.MeshPhongMaterial({
        color: 'rgb(230,132,34)'
      })
      const enemyMesh = new THREE.Mesh( enemyGeo, enemyMat );
      enemyMesh.position.set(2350, 0, -50);
      let enemyBoundingBox = new THREE.Box3(new Vector3, new Vector3);
      enemyBoundingBox.setFromObject(enemyMesh);
      scene.add( enemyMesh );

      const enemyMatTween = new Tween(enemyMesh.material.color)
          .to(new THREE.Color('rgb(255,210,200)'), 100)
          .repeat(Infinity)
          .yoyo(true)
          .easing(Easing.Quadratic.InOut)
          .start();

      const animate = (aniTime: any) => {

        if(playerMesh.geometry.boundingSphere && !levelLose) {
          //console.log('bounding box?: ', !!enemyMesh.geometry.boundingBox);
          //console.log(enemyBoundingBox.distanceToPoint(playerBoundingSphere.center));
          //console.log(!!enemyBoundingBox.intersectsSphere(playerBoundingSphere));
        }
        
        if(!levelLose && !levelWin) {

          // Collision detection for player and enemy
          if(winLoseLevelDiv && bigHand && littleHand && timerDiv && !levelWin && playerMesh.geometry.boundingSphere &&
            enemyBoundingBox.intersectsSphere(playerBoundingSphere)) {
            levelLose = true;
            console.log('COLLISION');
            bigHand.style.animationPlayState = 'paused';
            littleHand.style.animationPlayState = 'paused';
            timerDiv.classList.add('blink');
            winLoseLevelDiv.classList.add('slowUIEnter');
            winLoseLevelDiv.innerHTML = randomLoseMessage();
          }

          // Setup timer
          delta = clock.getDelta();
          time -= (speed * delta);
          timeText = `Left: ${Math.floor(time)}`;
          if (timerDiv) {
            timerDiv.innerHTML = timeText;
          };

          // Removing the instructions UI
          if (time <= 45 && instructionsDiv && !instructionsDiv.classList.contains('exitDom')) {
            instructionsDiv.classList.add('exitDom');
          }
          if (time <= 44 && instructionsDiv) {
            instructionsDiv.remove();
          }

          // BG movement
          hill1Mesh.position.x -= 0.04;
          hill2Mesh.position.x -= 0.04;
          hill3Mesh.position.x -= 0.04;
          hill4Mesh.position.x -= 0.04;

          for(let i = 0; i < NUM_OF_TREES; i++) {
            treeMeshArray[i].position.x -= 6;
            if(treeMeshArray[i].position.x <= -2000) {
              treeMeshArray[i].position.x = 2000
            }
          };

          // Winning trigger logic
          if(winLoseLevelDiv && bigHand && littleHand && Math.floor(time) <= 0) {
            levelWin = true;
            bigHand.style.animationPlayState = 'paused';
            littleHand.style.animationPlayState = 'paused';
            winLoseLevelDiv.classList.add('slowUIEnter');
            winLoseLevelDiv.classList.add('winningAnimation');
            winLoseLevelDiv.innerHTML = randomWinMessage();
          }
        }

          // Enemy movement 
          enemyDirection = Math.sign(playerMesh.position.y);
          enemyMesh.rotateZ(0.05);
          enemyMesh.position.x -= isMobileAspectRatio ? 4.5 : 3;
          enemyMesh.position.y += enemyDirection*enemySpeed;
          if(enemyMesh.position.y === playerMesh.position.y ||
            (enemyDirection >= 0 ? enemyMesh.position.y > playerMesh.position.y :
              enemyMesh.position.y < playerMesh.position.y)) {
            enemyMesh.position.y = playerMesh.position.y;
          }
          if(enemyMesh.position.x <= -250) {
            enemyMesh.position.x  = randomNumberRange(150,750);
          }
          // Have the enemy bounding box follow the enemy's position
          if (enemyMesh.geometry.boundingBox) {
            enemyBoundingBox.copy( enemyMesh.geometry.boundingBox ).applyMatrix4( enemyMesh.matrixWorld );
          }

          // Enemy material animation
          enemyMatTween.update(aniTime);

          if (levelLose) {
            playerAcceleration += 0.1;
            playerMesh.position.y -= 0.1+playerAcceleration;

            // BG movement
            hill1Mesh.position.x -= 0.008;
            hill2Mesh.position.x -= 0.008;
            hill3Mesh.position.x -= 0.008;
            hill4Mesh.position.x -= 0.008;

            for(let i = 0; i < NUM_OF_TREES; i++) {
              treeMeshArray[i].position.x -= 0.2;
              if(treeMeshArray[i].position.x <= -2000) {
                treeMeshArray[i].position.x = 2000
              }
            };
          } else if (levelWin) {
            playerAcceleration += 0.1;
            playerMesh.position.x += 0.1+playerAcceleration;

            // BG movement
            hill1Mesh.position.x -= 0.008;
            hill2Mesh.position.x -= 0.008;
            hill3Mesh.position.x -= 0.008;
            hill4Mesh.position.x -= 0.008;

            for(let i = 0; i < NUM_OF_TREES; i++) {
              treeMeshArray[i].position.x -= 0.2;
              if(treeMeshArray[i].position.x <= -2000) {
                treeMeshArray[i].position.x = 2000
              }
            };
          }

          requestAnimationFrame(animate);

          composer.render();
      };

      requestAnimationFrame(animate);
};

const randomNumberRange = (min: number, max: number) => { 
  return Math.random() * (max - min) + min;
};

const randomLoseMessage = (): string => {
  const randomNum = Math.floor(randomNumberRange(0,4));
  const loseMessages = [
    'Yikes. I mean you can always refresh to try again.',
    'Uh ooooh. Refresh time?',
    'That\'s a bummer my guy. Refresh?',
    'Yeah, you better refresh dude. That suckssss'
  ];
  return loseMessages[randomNum];
};

const randomWinMessage = (): string => {
  const randomNum = Math.floor(randomNumberRange(0,4));
  const winMessages = [
    'You fucking won dude! Refresh to give it another go.',
    'Wowzers brah! I\'m feeling a refresh comming on.',
    'Ho boi! Dats what\'s up. Refresh?',
    'Wiener gogeener shliener man! Refresh tiiiime.'
  ];
  return winMessages[randomNum];
};