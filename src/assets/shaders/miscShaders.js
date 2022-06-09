import * as THREE from 'three';

export const innerGlowShader = ( geometry ) => {
    return {
    uniforms: {
      color1: {
        value: new THREE.Color('rgb(175,130,85)')
      },
      color2: {
        value: new THREE.Color('rgb(255,240,230)')
      },
      bboxMin: {
        value: geometry.boundingBox ? geometry.boundingBox.min : new THREE.Vector2(0,0)
      },
      bboxMax: {
        value: geometry.boundingBox ? geometry.boundingBox.max : new THREE.Vector2(0,0)
      }
    },
    vertexShader: `
    
      varying vec2 vUv;
  
      void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
        #define PI 3.1415926
      #define TWO_PI PI*2.
          
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        vec2 uv = vUv * 2. - 1.;
        
        float a = atan(uv.x,uv.y)+PI;
        float r = TWO_PI/4.;
        float d = cos(floor(.5+a/r)*r-a)*length(uv);
        
        gl_FragColor = vec4(mix(color1, color2, d-0.5), 1.0);
      }
    `,
    };
  };