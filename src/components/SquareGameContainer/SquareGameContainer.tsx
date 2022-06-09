import React, { ReactElement } from 'react';
import * as THREE from 'three';
import { WEBGL } from '../../utils/webGLUtils/webGLUtils';
import { setupSquareGameLights, squareGameFunctionality } from '../../utils/squareGameUtils/squareGameUtils';
import './SquareGameContainer.css';

export const SquareGameContainer = (): ReactElement => {

    const [quality, setQuality] = React.useState<number>(2); // 2.5 = low quality | 1 = highest quality
    const [isMobileAspectRatio, setIsMobileAspectRatio] = React.useState(false);
    const [refresh, setRefresh] = React.useState(false);

    React.useEffect(() => {
        if ( WEBGL.isWebGLAvailable() ) {
            
            // Renderer setup
            let renderer = new THREE.WebGLRenderer({ antialias: false });
            renderer.setSize( window.innerWidth, window.innerHeight);
            renderer.setPixelRatio( window.devicePixelRatio/quality );
            renderer.autoClear = false;

            if(window.innerHeight > window.innerWidth && !isMobileAspectRatio) {
                setIsMobileAspectRatio(true);
            } else if (window.innerHeight <= window.innerWidth && isMobileAspectRatio) {
                setIsMobileAspectRatio(false);
            }

            renderer.domElement.id = 'dom';
            renderer.domElement.className = 'position-fixed';
            if (document.body.contains( document.getElementById( 'dom' ) ) === false) {
                document.body.append( renderer.domElement );
            } else {
                const dom = document.getElementById('dom');
                if(dom !== null) {
                    document.body.removeChild( dom );
                    document.body.append( renderer.domElement );
                } 
            }
            
            window.onresize = () => {
                renderer.setSize( window.innerWidth, window.innerHeight);
                setRefresh(!refresh);
            };

            // Camera / Scene setup
            let scene = new THREE.Scene();
            let camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 1, 3000);
            camera.position.set(0, 0, 450);

            setupSquareGameLights( scene );

            squareGameFunctionality( scene, renderer, camera, quality, isMobileAspectRatio );
            
        } else {
            const warning = WEBGL.getWebGLErrorMessage();
            document.body.appendChild( warning );
        }
    });

    return (
        <div data-testid='canvas' id='canvas'>
            <div id='timerContainer'>
                <div id='timerCircleAni'>
                    <div id='timerBigLineAni'></div>
                    <div id='timerSmallLineAni'></div>
                </div>
                <div id='timerDiv'></div>
            </div>
            <div id='instructionsContainer'>
                <div id='instructionsText'>Avoid the Squares!</div>
            </div>
        </div>
    )
};